import axios, { all } from 'axios'
import BotInstance from '../models/Bot-instance.js';
import dbConnect from "../utils/dbConnect.js"
import User from "../models/user.model.js";
import mongoose from 'mongoose';
import { decryptText } from '../utils/credentials_encrytor.js';
import { DB_URL } from '../utils/secretEnv.js';
import crypto from 'crypto'


const createAutoBot = async (req , res) => {
    try {
        await dbConnect();
        const {exchangePair , strategy , quantity , timeFrame} = req.body;

        console.log(exchangePair , strategy , quantity , timeFrame)
        if(!exchangePair || !strategy || !quantity || !timeFrame) return res.status(203).json({ message : "Provide all paramaters !!!"});


        const user = await User.findById( new mongoose.Types.ObjectId(req.user?.id));

        if(user.botCount > 5){
            return res.status(203).json({
                message : "Bot creation failed !!!",
                error : "Limit exceeded !!!",
                ok : false
            });
        };

        const apiKey = decryptText(user.exchangeCredentials[0].apiKeyEncrypted)
        const apiSecret = decryptText(user.exchangeCredentials[0].apiSecretEncrypted)
        const botId = forgeBotID(req.user , {strategy , exchangePair , date :  new Date()});


        if(!botId.status) return res.status(208).json({
            message : "Error : CREATING IDEMMPOTENCY KEY",
            error  : botId.error || "UNKNOWN SERVER ERROR"
        });

        const payload = {
            bot_pod_spec : {
                bot_name : botId.hash,
                pair : exchangePair,
                strategy,
                quantity,
                timeFrame
            },
            bot_user_spec :{
                botId : botId.hash,
                exchangeApiKey : apiKey,
                exchangeApiSecret : apiSecret,
                DB_URL : DB_URL
            }
        }

        // console.log(payload)
        //THIS FOLLOWING IS USED WHILE IN DEPLOYMENT WHILE IN LOACAL ENV YOU NEED TO USE THE HOST AND PORT
        // const response = await axios.post("http://orchservice/internal/orchestrator/v1/createbot" , payload , {});
        const response = await axios.post("http://127.0.0.1:8000/internal/orchestrator/v1/createbot" , payload , {});
        console.log(response.data.ok)
        console.log(response.data)

        if(!response.data.ok) return res.status(422).json({
            message : "[SERVER] : Bot creating error !!!",
            error : response.data.e
        });
        
        const newBot = new BotInstance({
            userId : req.user?.id,
            strategy,
            name : req.user.name,
            pair : exchangePair,
            params : payload,
            quantity,
            status : "idle",
            k8sPodName : botId.hash.toLowerCase()
        });
        
        await newBot.save();
        await User.findByIdAndUpdate({_id : new mongoose.Types.ObjectId(req.user?.id)} , {$inc : {botCount : 1}});
        return res.status(200).json({
            message : "Bot is created successfully !!",
            botId ,
            pod : response.data.pod_forged_meta.metadata.uid,
        });
    } catch (error) {
        console.log(error )
        return res.status(500).json({
            message : "Error : Autobot creation !!!",
            error : error.message 
        });
    }
};


const forgeBotID = (user , payload) => {
    try {
        const jsonData = JSON.stringify(payload);
        const hashString = `${jsonData}|${user.name}|${user.email}`;
        
        const hmac = crypto.createHmac("sha256" , user.email).update(hashString , 'utf8').digest();
        const botID64 = hmac.toString("base64").replace(/\+/g, '-').replace(/\//g, '.').replace(/=+$/, '');
        
        return {
            status : true,
            hash : botID64
        };
    } catch (error) {
        return {
            status : false,
            error : error
        }
    }
};


const stopBot = async (req , res) => {
    try {
        await dbConnect();
        const {botID  } = req.body;
        if(!botID) return res.status(410).json({
            message : "Provide Bot_ID"
        });
        
        const isBotRunning = await BotInstance.findOne({"k8sPodName" : botID});
        console.log(botID)
        if(!isBotRunning) return res.status(410).json({
            message : "[SERVER] : No Bot Logged !!!",
            ok : false
        });
        
        if(["completed" , "stopped"].includes(isBotRunning.status)) return res.status(205).json({
            message : "[SERVER] : Bot not Active !!!",
            status : isBotRunning.status,
            ok : true
        });

        const payload = {
            user : req.user,
            botID
        }
        
        //FOLLOWING URL IS USED FOR LOCAL TESTING AND ANOTEHR FOR DEPLOYMENT 
        // const response = await axios.post("http://orchservice/internal/orchestrator/v1/createbot" , payload , {});
        const response = await axios.post("http://127.0.0.1:8000/internal/orchestrator/v1/destbot", payload ,{});
        if(!response.data.ok) return res.status(422).json({
            message : "[SERVER] : Bot Stop Failed !!!",
            ok : false
        });

        console.log(response.data)

        await BotInstance.findOneAndUpdate({k8sPodName : botID} , {status : "stopped"})
        return res.status(200).json({
            message : "Bot successfully stopped !!!",
            orch : response.data.message,
            ok : true
        });
    } catch (error) {
        return res.status(500).json({
            message : "Internal server error",
            error : error.message
        });
    }
}


const getAllBots = async (req , res) => {
    try {
        await dbConnect();
        console.log("get all bots")

        const user = req.user;
        if(!user) return res.status(410).json({
            message : "Request is not authenticated !!!",
            ok : false
        })
        const allBots = await BotInstance.find({userId : new mongoose.Types.ObjectId(req.user.id)});
        return res.status(200).json({
            message : "Bot fetched succesfully !!!",
            ok : true,
            bots : allBots
        });
    } catch (error) {

        console.log(error.message)
        return res.status(500).json({
            message : "Internal Server error !",
            error : error.message | error,
            ok : false
        })
    }
}


const getBotDetails = async (req , res) => {
    try {
        await dbConnect();
        const {id} = req.params;

        const response = await BotInstance.findById(new mongoose.Types.ObjectId(id));
        if(!response) return res.status(209).json({
            message : "Bot id tempored !!",
            ok : false
        })
        return res.status(200).json({
            message : "Bot Information fethced !!",
            ok : true,
            bot : response
        })
    } catch (error) {
        return res.status(500).json({
            message : "Internal Server Error",
            ok : false,
            error : error.message || error
        })
    }
}
export {
    createAutoBot,
    stopBot,
    getAllBots,
    getBotDetails
}