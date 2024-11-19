import { handelAllRequests } from "../controllers/animationHandlerContoller.js";
import express from "express";
import upload from '../middlewares/fileUpload.js';
import { UserAuth } from '../middlewares/Authentication/UserAuth.js';

const router = express.Router();

router.post('/generate/sequence/isl', UserAuth , upload.single('file'), handelAllRequests);

export default router;