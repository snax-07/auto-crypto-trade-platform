import dbConnect from "../utils/dbConnect.js"
import User from "../models/user.model.js";
import { JWT_REFRESH_SECRET , JWT_SECRET } from "../utils/secretEnv.js";
import  { sendPasswordResetMail , sendOtpEmail } from "../utils/NodeMailer.js";
import {authenticator} from "otplib"
import jwt from "jsonwebtoken"
import { forgeRedisClient } from "../redis/redis-obsidian-client.js";
import getExchnageInfo from "../helper/exchange-info.js";
import { validateOrder } from "../helper/filterValidator.js";
import ResetToken from "../models/passwordResetToken.js";
import mongoose from "mongoose";

export const generateTokens = (user) => {
    const payload = { id: user._id , name : user.name, email: user.email  , isVerified : user.isVerified , isPanVerified : user.isPanVerified};

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

const RegisterUser = async (req , res) => {
    try {
            await  dbConnect();
            const  {email , name , password} = req.body;

            const existingUser = await User.findOne({email});

            if(existingUser && existingUser.isVerified){
                return res.status(409).send({
                    message : "User is already with credentials !!!",
                    ok : false
                });
            };
            
            if(existingUser && !existingUser.isVerified){
                const otp = authenticator.generate(authenticator.generateSecret());
                await existingUser.hashOtp(otp);
                await sendOtpEmail(email , "Account Verification" , "OtpVerification" , name.split(" ")[0] , otp );
                await existingUser.save();
                return res.status(409).json({
                    message : "Verify Account !!!",
                    ok : true,
                    nextRoute : `/acc/verification?email=${email}`
                });
            };

            const otp = authenticator.generate(authenticator.generateSecret())


            const newUser = new User({
                email,
                name
            });

            await newUser.setPassword(password);
            await newUser.hashOtp(otp);

            await sendOtpEmail(email , "Account Verification" , "OtpVerification" , name.split(" ")[0] , otp )

            return res.status(200).send({
                message : "User registered successfully !!",
                nextRoute : `/acc/verification?email=${email}`,
                ok : true
            })
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({
            message : "Error while registering the user !!!",
            error : error.message
        })   
    }
};

const LoginUser = async (req, res) => {
    try {
        console.log("Request REC")
        await dbConnect();
        const { email, password } = req.body;
        if(!email || !password) return res.status(410).json({
            message : "Provide Credentials !!!",
            ok : false
        });
        const isUserExist = await User.findOne({ email }).select("--refreshToken --exchangeCredentials --UIDAINumber");
        if (!isUserExist) {
            return res.status(404).json({ message: "User not found !!!" , ok : false });
        }
        
        const isValid = await isUserExist.verifyPassword(password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials !!!"  , ok : false });
        }

        const { accessToken, refreshToken } = generateTokens(isUserExist);
        isUserExist.refreshToken = refreshToken;
        await isUserExist.save();

        // Set cookies first, then send response
        return res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true  , sameSite : 'lax'})
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true  , sameSite : 'lax'})
            .cookie('user' , isUserExist , {httpOnly : true , secure : true , sameSite : 'lax'})
            .status(200)
            .json({ message: "User Logged Successfully !!!" , ok : true});

    } catch (error) {
        return res.status(500).json({
            message: "Authentication Failed !!!",
            error: error.message
        });
    }
};

const exchangeCredentials = async (req , res) => {
    try {
        await dbConnect();
        const {exchangeName , apiKey , apiSecret} = req.body;
        const user = await User.findOne({_id : new mongoose.Types.ObjectId(req.user.id)});
        const cred = await user.addExchangeCredential({exchangeName , apiKey , apiSecret});
        console.log(cred)
        await user.save();

        return res.status(200).json({
            message : "Credentials updated successfully !!!"
        })
    } catch (error) {
        return res.status(500).json({
            message : "Error while updating exchange credentials !!!",
            error : error.message
        })
    }
};

const updateExchangeCredentials = async (req , res) => {
    try {
        await dbConnect();
        const {exchangeId} = req.params;
        const {exchangeName = null , apiKey = null , apiSecret = null} = req.body;

        const user = await User.findOne({_id : new mongoose.Types.ObjectId(req.user?.id)});
        await user.updateExchangeCredential(exchangeId , {exchangeName , apiKey , apiSecret});
        await user.save();
        return res.status(200).json({
            message : "Exchange Credentials Updated !!!"
        });
    } catch (error) {
        return res.status(500).json({
            message : "Error : Updating Exchange Credentials !!",
            error : error.message
        });
    }
};

const removeExchangeCredential = async (req , res) => {
    try {
        await dbConnect();
        const {exchangeId} = req.body;
        const user = await User.findOne({_id : req.user.id});
        await user.removeExchangeCredential(new mongoose.Types.ObjectId(exchangeId));
        await user.save();
        return res.status(200).json({
            message : "Credentials removed successfully !!!",
            // DeletedExchangeName : 
        });
    } catch (error) {
        return res.status(500).json({
            message : "Error : Delete Exchange Credentials !!!",
            error : error.message
        });
    }
};

const getAllCredentials = async (req , res) => {
    try {
        await dbConnect();

        const list = await User.findOne({ _id : new mongoose.Types.ObjectId(req.user?.id)} , {exchangeCredentials : 1 , _id : 0});
        return res.status(200).json({
            message : "Exchange Credentials Fetched Successfully !!!",
            credentialsList : [...list.exchangeCredentials]
        });
    } catch (error) {
        return res.status(500).json({
            message : "Error : Getting All Credentials !!!",
            error : error.message
        });
    }
};


const verifyOtp = async (req, res) => {
    try {
        await dbConnect();
        const {email , otp} = req.body;
        const isVerified = await User.findOne({email}).select("--refreshToken --exchangeCredentials --UIDAINumber");

        const response = await isVerified.verifyOtp(otp);
        if(!response.status) return res.status(410).send({...response});
        const {accessToken , refreshToken} = generateTokens(isVerified);
        isVerified.refreshToken = refreshToken;
        await isVerified.save();

        return res
                .status(200)
                .cookie("accessToken" , accessToken , {httpOnly : true , secure : false , sameSite : "lax"})
                .cookie("refreshToken" , refreshToken, {httpOnly : true , secure : false , sameSite : "lax"})
                .json({message : "user verified successfully !!!" , ok : true})
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({
            message : "Error while verification",
            error : error.message || error
        })
    }
}


const forgeMarketTrade = async (req , res) => {
    try {

        const {pair , quantity , quoteOrderQty , type , side , price} = req.body;

        const symInfo = await getExchnageInfo(pair);
        const isValid = validateOrder(symInfo , {price , qty : quantity , quoteOrderQty : quoteOrderQty});
        if(!isValid.ok) return res.status(410).json({
            message : isValid.error || "[ERROR creating order !!!]"
        })


        const client = forgeRedisClient();

        (await client).lPush(
            `orders_${type.toLowerCase()}`,
            JSON.stringify({
                order_type : type.toUpperCase(),
                order_symbol : pair,
                order_quantity  : quantity,
                order_quoteOrderQty : quoteOrderQty,
                order_side : side.toUpperCase(),
                user_id : "req.user.id"
            })
        );
        return res.status(200).json({
            message : "Trade created successfully !!!"
        })
    } catch (error) {
        return res.status(500).json({
            message : "[Error] Creating order !!",
            error : error.message || error.response || error
        })
    }
};


const changePassword = async (req , res) => {
    try {
        await dbConnect();
        const {oldPassword , newPassword} = req.body;

        const existingUser = await User.findOne({_id : req.user?.id});
        const isValidAuth = await existingUser.verifyPassword(oldPassword);

        if(!isValidAuth) return res
                                .status(403)
                                .json({
                                    message : "Credentials is Invalid !!!"
                                });

        await existingUser.changePassword(newPassword);
        await existingUser.save();


        return res.status(200).json({
            message : "Password changed successfully !!!"
        });
    } catch (error) {
        return res.status(500).json({
            message : "[ERROR]change password",
            error : error.message || error
        });
    }
};


const intiResetPassword = async (req , res) => {
    try {
        await dbConnect();
        const {email } = req.body;
        if(!email) return res.status(410).json({
            message : "Credential is required !!!",
            ok : false
        });
        if (typeof email !== "string") {
            return res.status(400).json({
                message: "Invalid email format!",
                ok : false
            });
        }
        const existingUser = await User.findOne({ email });
        if(!existingUser) return res.status(410).json({
            message : "User not found !!!",
            ok : false
        });

        const token = await ResetToken.createTokenForUser(existingUser._id);
        const url = `http://localhost:3000/forgotP/${token}`;
        console.log(url)
        await sendPasswordResetMail(email , url);
        
        return res.status(200).json({
            ok : true,
            message : `Reset Link sent to ${email}`
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message : "[ERROR] Sending password reset link !!!",
            error : error.message || error,
            ok : false
        })
    }
}
const resetPassword = async (req , res) => {
    try {
        await dbConnect();
        const {newPassword , token} = req.body;

        if(!token) return res.status(410).json({
            message : "Token Miising !!!"
        });

        console.log(token)
        const {valid , record , reason} = await ResetToken.validateToken(token);
        if(!valid) return res.status(203).json({
            message : reason,
            ok : valid
        });

        const existingUser = await User.findOne({_id : record.userId});
        await existingUser.changePassword(newPassword);
        await ResetToken.findOneAndUpdate({token} , {$set : {used : true}})
        await existingUser.save();
        if(!existingUser) return 
        return res.status(200).json({
            message : "Password changed successfully !!!",
            ok : true
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message : "[ERROR]change password",
            error : error.message || error
        });
    }
}

const test = async (req , res) => {

    await sendOtpEmail("swapnilnade07@gmail.com" , "Test mail" , 'OtpVerification' , {name : "snax"})
    return res.json({
        m : "hello"
    })
}

export {
    test,

    RegisterUser,
    LoginUser,
    verifyOtp,
    changePassword,
    intiResetPassword,
    resetPassword,


    exchangeCredentials,
    removeExchangeCredential,
    updateExchangeCredentials,
    getAllCredentials,

    forgeMarketTrade,



}