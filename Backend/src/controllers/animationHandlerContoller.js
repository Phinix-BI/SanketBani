import responseHandler from "../utils/resHandler.js";
import errorResponseHandler from "../utils/errorResponseHandler.js";
import {
    textToIsl,
    speechToIsl,
    imgToIsl,
} from "../helpers/chatServicesHandler.js";

export const handelAllRequests = async (req, res) => {
    const { text } = req.body;
    const file = req.file;

    if (!text && !file) {
        return errorResponseHandler(res, 400, "Please provide text or file");
    }

    let selectedService;

    if (text) {
        selectedService = "textToIsl";
    } else if (file) {
        if (file.mimetype.startsWith("image")) {
            selectedService = "imgToIsl";
        } else if (file.mimetype.startsWith("audio")) {
            selectedService = "speechToIsl";
            
        } else {
            return errorResponseHandler(res, 400, "Unsupported file type");
        }
    }

    try {
        if (text) {
            if (selectedService === "textToIsl") {
                const result = await textToIsl(text);
                return responseHandler(
                    res,
                    200,
                    "Response generated succesfully",
                    result
                );
            }
        }

        if (file) {
            if (selectedService === "imgToIsl") {
                const result = await imgToIsl(file);
                return responseHandler(
                    res,
                    200,
                    "Response generated succesfully",
                    result
                );
            } else if (selectedService === "speechToIsl") {
                const result = await speechToIsl(file);
                return responseHandler(
                    res,
                    200,
                    "Response generated succesfully",
                    result
                );
            }
        }

        return errorResponseHandler(res, 400, "Unsupported service");
    } catch (error) {
        return errorResponseHandler(
            res,
            500,
            "Error occured while processing request for service"
        );
    }
};
