import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import { generateFromEmail } from "unique-username-generator";
import responseHandler from "../utils/resHandler.js";
import errorResponseHandler from "../utils/errorResponseHandler.js";


export const registerUser = async (req, res) => {

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return errorResponseHandler(res, 400, "error", "Please fill in all fields");
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return errorResponseHandler(res, 400, "error", "User already exists");
        }

        const userName = generateFromEmail(email, 5, 10, "sanket");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            userName,
            email,
            password: hashedPassword

        });

        user.save();

        return responseHandler(res, 200, "success", "User registered successfully", user);

    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem registering user");
    }
}

export const loginUser = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return errorResponseHandler(res, 400, "error", "Please fill in all fields");
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return errorResponseHandler(res, 400, "error", "Invalid credentials");
        }

        const token = jwt.sign({ email: user.email, id: user._id, verified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: "60d" });

        user.token = token;

        user.save();

        return responseHandler(res, 200, "success", "User logged in successfully", token);

    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem logging in user");
    }
}

export const googleAuth = async (req, res) => {

    if (!req.body.userInfo || !req.body.userInfo.data || !req.body.userInfo.data.user) {
        return errorResponseHandler(res, 400, "error", "Google auth data not found");
    }
    
    const { name, email, photo } = req.body.userInfo.data.user;
    
    const authType = req.body.userInfo.type;

    if (!name || !email) {
        return errorResponseHandler(res, 400, "error", "Google auth data not found");
    }
    if (authType !== "success") {
        return errorResponseHandler(res, 400, "error", "Google auth failed");
    }

    try {
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            userExists.isVerified = true; //by using google auth old unvarified user is now verified
            const token = jwt.sign({ email: userExists.email, id: userExists._id, verified: userExists.isVerified }, process.env.JWT_SECRET, { expiresIn: "60d" });
            userExists.token = token; //updating token
            await userExists.save();
            return responseHandler(res, 200, "success", "User logged in successfully through Google", token);
        } else {
            const userName = generateFromEmail(email, 5, 10, "sanket");

            const user = await User.create({
                fullName: name,
                userName,
                email,
                profilePicture: photo,
                isVerified: true
            });

            const token = jwt.sign({ email: user.email, id: user._id, verified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: "60d" });
            user.token = token;
            await user.save();
            return responseHandler(res, 200, "success", "User registered successfully through Google", token);

        }

    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem logging in user through Google");
    }

}

export const sentOtp = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return errorResponseHandler(res, 400, "error", "Please fill in all fields");
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const otpExpire = new Date();

        otpExpire.setMinutes(otpExpire.getMinutes() + 10);

        const response = await User.updateOne({ email: email }, { otp: otp, otpExpire: otpExpire });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP for password reset',
            html: `<h3>OTP for password reset is </h3><h1 style="font-weight:bold">${otp}</h1>`
        };

        const result = await transporter.sendMail(mailOptions);

        if (!result) {
            return errorResponseHandler(res, 500, "error", "Error from nodemailer");
        }

        return responseHandler(res, 200, "success", "OTP sent successfully");
    } catch (error) {
        console.log(error);
        return errorResponseHandler(res, 500, "error", "Problem sending OTP");
    }
}

export const verifyOtp = async ({ email, otp }) => {

    if (!email || !otp) {
        return { code: 400, status: "error", message: "Please fill in all fields" };
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return { code: 400, status: "error", message: "User does not exist" };
        }

        if (user.otp != otp) {
            return { code: 400, status: "error", message: "Invalid OTP" };
        }

        const currentTime = new Date();

        if (currentTime > user.otpExpire) {
            return { code: 400, status: "error", message: "OTP expired" };
        }

        return { code: 200, status: "success", message: "OTP verified successfully" };

    } catch (error) {
        return { code: 500, status: "error", message: "Problem verifying OTP" };
    }
}

export const resetPassword = async (req, res) => {

    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
        return errorResponseHandler(res, 400, "error", "Please fill in all fields");
    }

    if (password !== confirmPassword) {
        return errorResponseHandler(res, 400, "error", "Passwords do not match");
    }

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }
        const response = await verifyOtp({ email, otp });

        if (response.status === "error") {
            return errorResponseHandler(res, 400, "error", response.message);
        }

        const comparePassword = await bcrypt.compare(password, user.password);

        if (comparePassword) {
            return errorResponseHandler(res, 400, "error", "Cannot use old password");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpire = null;

        user.save();

        return responseHandler(res, 200, "success", "Password reset successfully");

    } catch (error) {
        console.log(error);
        return errorResponseHandler(res, 500, "error", "Problem resetting password");
    }

}

export const verifyEmail = async (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
        return errorResponseHandler(res, 400, "error", "Please fill in all fields");
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }

        if (user.isVerified) {
            return errorResponseHandler(res, 400, "error", "User already verified");
        }

        const response = await verifyOtp({ email, otp });

        if (response.status === "error") {
            return errorResponseHandler(res, 400, "error", response.message);
        }

        user.isVerified = true;

        const token = jwt.sign({ email: user.email, id: user._id, verified: true }, process.env.JWT_SECRET, { expiresIn: "60d" });

        user.token = token;

        user.save();

        return responseHandler(res, 200, "success", "User verified successfully", token);

    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem verifying user");
    }
}

export const getUser = async (req, res) => {

    try {
        const token = req.headers["x-auth-token"];

        if (!token) {
            return errorResponseHandler(res, 400, "error", "Please provide token");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id.toString(); // Convert userId to a string

        const user = await User.findById(userId);

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }

        return responseHandler(res, 200, "success", "Users fetched successfully", user);

    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem fetching users");
    }
}

export const updateUser = async (req, res) => {
    const token = req.headers["x-auth-token"];

    if (!token) {
        return errorResponseHandler(res, 400, "error", "Please provide token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id.toString(); // Convert userId to a string

    const { fullName, gender, category } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }

        user.fullName = fullName || user.fullName;
        user.gender = gender || user.gender;
        user.category = category || user.category;

        user.save();

        return responseHandler(res, 200, "success", "User updated successfully");
    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem updating user");
    }
}

export const getUserId = async (req, res) => {
    const { userEmail } = req.params;

    if (!userEmail) {
        return errorResponseHandler(res, 400, "error", "Please provide email");
    }

    try {
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return errorResponseHandler(res, 400, "error", "User does not exist");
        }

        return responseHandler(res, 200, "success", "User fetched successfully", { id: user._id });
    } catch (error) {
        return errorResponseHandler(res, 500, "error", "Problem fetching user");
    }
}
