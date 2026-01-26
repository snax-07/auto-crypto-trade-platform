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
import mongoose, { deleteModel } from "mongoose";
import TradeHis from "../models/eventLogger.js"


export const generateTokens = (user) => {
    const payload = { id: user._id , name : user.name, email: user.email  , isVerified : user.isVerified , isPanVerified : user.isPanVerified , fa2 : user.fa2};

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
            
            const newUser = User({
                 name,
                 email,
            })
            await newUser.setPassword(password);
            await newUser.hashOtp(otp);
            await newUser.save();

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
        console.log(email)
        console.log(password)
        if(!email || !password) return res.status(410).json({
            message : "Provide Credentials !!!",
            ok : false
        });
        const isUserExist = await User.findOne({ email });
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
            .status(200)
            .json({ message: "User Logged Successfully !!!" , ok : true});

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: "Authentication Failed !!!",
            error: error.message
        });
    }
};

const logout = async (req , res) => {
    try {
        return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json({
            message : "user logged out !!!"
        })
    } catch (error) {
        return res.status(500).json({
            message : "Error while Logging out !!!"
        })
    }
}

const exchangeCredentials = async (req , res) => {
    try {
        await dbConnect();
        const {exchangeName , apiKey , apiSecret} = req.body;
        const user = await User.findOne({_id : new mongoose.Types.ObjectId(req.user.id)});

        if(user.exchangeCredentials.length > 0)user.exchangeCredentials[0].isActive = false;
        const cred = await user.addExchangeCredential({exchangeName , apiKey , apiSecret});
        await user.save();

        return res.status(200).json({
            message : "Credentials updated successfully !!!"
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message : "Error while updating exchange credentials !!!",
            error : error.message
        })
    }
};

const updateExchangeCredentials = async (req, res) => {
  try {
    const { exchangeId } = req.params;

    await dbConnect();
    
    if (!exchangeId || !mongoose.Types.ObjectId.isValid(exchangeId)) {
      return res.status(400).json({ message: "Valid exchangeId is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exchanges = user.exchangeCredentials;


    const targetIndex = exchanges.findIndex(
      ec => ec._id.toString() === exchangeId
    );

    if (targetIndex === -1) {
      return res.status(404).json({ message: "Exchange not found" });
    }


    exchanges.forEach(ec => {
      ec.isActive = false;
    });


    exchanges[targetIndex].isActive = true;


    const [activeExchange] = exchanges.splice(targetIndex, 1);
    exchanges.unshift(activeExchange);

    await user.save();

    return res.status(200).json({
      message: "Exchange activated successfully",
      keyName : user.exchangeCredentials[0].exchangeName
    });

  } catch (error) {
    console.error("Exchange toggle error:", error.message);
    return res.status(500).json({
      message: "Error updating exchange credentials",
      error: error.message,
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

        console.log(req.user)
        const list = await User.findOne({ _id : new mongoose.Types.ObjectId(req.user?.id)} , {exchangeCredentials : 1 , _id : 0});
        console.log(list)
        return res.status(200).json({
            message : "Exchange Credentials Fetched Successfully !!!",
            credentials : [...list.exchangeCredentials]
        });
    } catch (error) {
        console.log(error.message)
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
        console.log(isVerified)
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


const forgeMarketTrade = async (req, res) => {
    try {
        const { pair, type, side, order_price, order_quantity, order_quoteOrderQty } = req.body;
        
        // 1. Validation Logic
        const symInfo = await getExchnageInfo(pair);
        const isValid = validateOrder(symInfo, { 
            price: order_price, 
            qty: order_quantity, 
            quoteOrderQty: order_quoteOrderQty, 
            type 
        });

        if (!isValid.ok) {
            return res.status(410).json({ message: isValid.error || "Validation Failed" });
        }

        const client = await forgeRedisClient();

        // 2. Build Payload to match Go Struct Tags exactly
        const payload = {
            type: type.toUpperCase(),
            pair: pair,
            side: side.toUpperCase(),
            order_price: parseFloat(order_price) || 0,
            order_quantity: parseFloat(order_quantity) || 0,
            order_quoteOrderQty: parseFloat(order_quoteOrderQty) || 0,
            user_email: req.user?.email || req.body.user_email
        };

        // 3. Queue the order
        const queueName = `orders_${type.toLowerCase()}`;
        await client.lPush(queueName, JSON.stringify(payload));
        
        return res.status(200).json({
            message: "Trade successfully queued",
            ok: true
        });
    } catch (error) {
        console.error("Redis Push Error:", error);
        return res.status(500).json({ ok: false, error: error.message });
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
};

const returnMe = async (req , res) => {
    try {
        await dbConnect();

        const user = await User.findOne({email : req.user?.email} , 
            {email : 1,
             name : 1,
             subscription : 1,
             isPanVerified : 1,
             marketWatchList : 1,
             referralCode : 1,
             phoneNumber : 1,
             fa2 : 1
            });

        return res.status(200).json({
            message : "User Fetched succesfully !!",
            user,
            ok : true
        })
    } catch (error) {
        return res.status(500).json({
            message : "Error while fetching user !!",
            error : error.message,
            ok : true
        })
    }
};

const setReferralCode = async (req ,res) =>{
    try {
        console.log()
        await dbConnect();
        const {referralCode} = req.body
        if(!referralCode) return res.status(410).json({
            message : "[SERVER] Provide Credentials !!!"
        })
        const user = await User.findOne({email : req.user?.email});
        user.referralCode = referralCode;
        await user.save();
        return res.status(200).json({
            message : "[SERVER] Referreal code Updated !!!",
            ok : true
        });
    } catch (error) {
        return res.status(500).json({
            message : "[SERVER] Set Referral",
            error : error.message,
            ok: false
        });
    }
};

const setPhoneNumber = async (req , res) => {
    try {
        await dbConnect();
        const {PhoneNumber} = req.body
        const user = await User.findOne({email : req.user?.email});
        user.PhoneNumber = PhoneNumber;
        await user.save();
        
        return res.status(200).json({
            message : "[SERVER] Phone Updated !!!" ,
            ok : true
        });
    } catch (error) {
        return res.status(500).json({
            message : "[SERVER] Phone update !!!",
            error : error.message,
            ok : false
        })
    }
}

const getAllOrders = async (req , res) => {
    try {
        await dbConnect();
        const user = req.user
        const history = await TradeHis.find();

        return res.status(200).json({
            message : "Order Fetched Successfull !!",
            history,
            ok : true
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message :"[SERVER] Internal Error",
            error : error.message | error,
            ok : false
        })
    }
};

const updateInfo = async (req, res) => {
    try {
            await dbConnect();
            const user = req.user
            // if(!confirmpassword && (!name || !email)) return res.status(410).json({
            //     message : "Required parameteres !!!",
            //     ok : false
            // });

            const otp = authenticator.generate(authenticator.generateSecret())
            const existingUser = await User.findOne({email : user.email});
            existingUser.hashOtp(otp);
            // existingUser.name = name;
            // existingUser.email = email;
            await existingUser.save()
            sendOtpEmail(user.email , "Veirfy Email" , "OTPVerification" , user.name.split(" ")[0] , otp );

            return res.status(200).json({
                message : "Information updated successfully !!!",
                ok : true
            })
    } catch (error) {
        return res.status(500).json({
            message : "Interal error",
            ok : false
        })
    }
}

const updateVerifier = async (req , res) => {
    try {
        await dbConnect();
        const {otp, email , name} = req.body;
        const user = req.user;
        const existingUser = await User.findOne({email : user.email});
        const isCorrect = await existingUser.verifyOtp(otp);
        console.log(isCorrect)
        if(!isCorrect.status) return res.status(403).json({
            message : isCorrect.message,
            ok : false
        });
        existingUser.name = name ? name : user.name;
        existingUser.email = email ? email : user.email;
        await existingUser.save();

        return res.status(200).json({
            message : "Detail updated successfully !!!",
            ok : true
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message : "INternal server error !!!",
            ok : false,
            error : error.message || error
        })
    }
}

const update2FA = async (req , res) => {
    try {
        await dbConnect();
        const {email , sms} = req.body;
        await User.findOneAndUpdate({
            email : req.user?.email
        } ,{
            fa2 : {
                email2FA : email,
                sms2FA: sms
            }
        });

        return res.status(200).json({
            message : "2FA updated successfully !!!",
            ok : true
        });
    } catch (error) {
        return res.status(500).json({
            message : "Internal server error",
            ok : false,
            error : error.message || error
        })
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
    updateInfo,
    updateVerifier,
    update2FA,

    setReferralCode,
    setPhoneNumber,

    exchangeCredentials,
    removeExchangeCredential,
    updateExchangeCredentials,
    getAllCredentials,

    forgeMarketTrade,
    returnMe,
    getAllOrders,


    logout


}