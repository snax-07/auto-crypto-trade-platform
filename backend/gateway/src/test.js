import { sendOtpEmail, sendPasswordResetMail } from "./utils/NodeMailer.js";



const resp = await sendOtpEmail("swapnilnade07@gmail.com" , "demo", "OtpVerification" , "demo" , 112122)