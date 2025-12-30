import e from "express";
import verifyToken from "../utils/middleware-auth.js";
import { createAutoBot, getAllBots, getBotDetails, stopBot } from "../controllers/botManagementController.js";
import authoriseBotInit from "../utils/botAuthoriser.js";

const botRouter = e.Router();


//PROTECTED. ROUTES FOR BOT CREATION
botRouter.route('/create').post(verifyToken, authoriseBotInit,  createAutoBot);
botRouter.route('/stop').post(verifyToken , stopBot);
botRouter.route('/getBots').get(verifyToken , getAllBots)
botRouter.route('/:id').get(verifyToken , getBotDetails)

//THIS ROUTES ARE ONLY USED FOR TESTING PURPOSE
botRouter.route('/botdemo').post(verifyToken , createAutoBot);



export default botRouter