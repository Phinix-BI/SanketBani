
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : [true, "Please provide your full name"]
    },
    userName : {
        type : String,
        unique : [true, "Username already exists"],
    },
    email : {
        type : String,
        required : [true, "Please provide your email"],
        unique : [true, "Email already exists"],
    },
    password : {
        type : String,
        // required : [true, "Please provide your password"],
    },
    gender :{
        type : String,

    },
    category : {
        type : String,

    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
    },
    otp: {
        type: Number,
    },
    otpExpire: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    chatHistory: [String],
    profilePicture: {
        type: String,
        default: "https://res.cloudinary.com/dpcor2qvh/image/upload/v1733758881/default-avatar-icon-of-social-media-user-vector_wpylcd.jpg"
    },
    friendList : [
        {
            userId : {
             type : mongoose.Schema.Types.ObjectId,
             ref : "User"
             },
            userName : {
                type : String,
            },
            profilePicture: {
                type: String,
                default: "https://res.cloudinary.com/dj7k9b8ps/image/upload/v1620286627/Profile%20Pictures/default-profile-picture-300x300.jpg"
            },
            email : {
                type : String,
            },
        }
    ]

    })

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;