import e from "express";
import verifyToken from "../utils/middleware-auth.js";
import { createAutoBot } from "../controllers/botManagementController.js";
import authoriseBotInit from "../utils/botAuthoriser.js";

const botRouter = e.Router();


//PROTECTED. ROUTES FOR BOT CREATION
botRouter.route('/bot/create').post(verifyToken, authoriseBotInit,  createAutoBot);


//THIS ROUTES ARE ONLY USED FOR TESTING PURPOSE
botRouter.route('/botdemo').post(verifyToken , createAutoBot);


export default botRouter