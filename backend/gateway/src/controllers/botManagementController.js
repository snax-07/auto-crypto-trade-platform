import axios from 'axios'
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

        if(!exchangePair || !strategy || !quantity || !timeFrame) return res.status(203).json({ message : "Provide all paramaters !!!"});


        const user = await User.findById( new mongoose.Types.ObjectId(req.user?.id));

        if(user.botCount > 5){
            return res.status(203).json({
                message : "Limit exceeded !!",
                error : "Bot creation failed !!!"
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
        // const response = await axios.post("http://orchservice/internal/orchestor/v1/createbot" , payload , {});
        const response = await axios.post("http://127.0.0.1:8000/internal/orchestrator/v1/createbot" , payload , {});
        console.log(response.data)

        const newBot = new BotInstance({
            userId : req.user?.id,
            strategy,
            name : req.user.name,
            pair : exchangePair,
            params : payload,
            quantity,
            status : response.data.status,
            k8sPodName : `${req.user?.id}_${exchangePair}_${strategy}`
        });

        await newBot.save();
        await User.findByIdAndUpdate({_id : new mongoose.Types.ObjectId(req.user?.id)} , {$inc : {botCount : 1}});
        return res.status(200).json({
            message : "Bot is created successfully !!",
            botId ,
            botName,
            botPair,
            botStat
        });
    } catch (error) {
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
}


export {
    createAutoBot
}