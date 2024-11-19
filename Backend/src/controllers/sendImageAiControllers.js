import responseHandler from "../utils/resHandler.js";
import errorResponseHandler from "../utils/errorResponseHandler.js";
import fs from "fs";
import axios from "axios";

export const sendImageAi = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return errorResponseHandler(res, 400, 'error', 'Please upload an image');
        }
        
        // path needs to be changed to the path of the image on the server
        const apiDataUpload = await axios.post('http://127.0.0.1:5000/predict', {"url" : file.path}).then((response) => {
            console.log(response.data);
            return responseHandler(res, 200, 'success', 'server picture uploaded successfully', { predictedData: response.data });
        }).catch((error) => {
            return errorResponseHandler(res, 500, 'error', 'Problem uploading ai picture');
        }).finally(() => {
            // fs.unlinkSync(file.path);
        });
        
    } catch (error) {
        // fs.unlinkSync(file.path);
        return errorResponseHandler(res, 500, 'error', 'Problem uploading ai picture');
}
}

export const sendImageFromUrl = async (req, res) => {
    try {
        const {url} = req.body;

        if (!url) {
            return errorResponseHandler(res, 400, 'error', 'Please upload an image');
        }
        
        // path needs to be changed to the path of the image on the server
        const apiDataUpload = await axios.post('http://127.0.0.1:8000/predictVideoFromLink', {"url" : url}).then((response) => {
            console.log(response.data);
            return responseHandler(res, 200, 'success', 'server picture uploaded successfully', { predictedData: response.data });
        }).catch((error) => {
            return errorResponseHandler(res, 500, 'error', 'Problem uploading ai picture');
        })
        
    } catch (error) {
        return errorResponseHandler(res, 500, 'error', 'Problem uploading ai picture');
}
}