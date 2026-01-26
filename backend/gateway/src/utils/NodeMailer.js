import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
import {EMAIL_USER} from './secretEnv.js';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MiddleTransporter = nodemailer.createTransport({
    host : "smtp.gmail.com",
    port : 587,
    auth : {user : "snaxquantum@gmail.com" , pass : "vyna ufac wpbh mmld"}
});

const templateDir = path.join(__dirname, '..', 'template');

const handlerBarOptions = {
  viewEngine: {
    extname: '.hbs',
    layoutsDir: templateDir,
    defaultLayout: 'main',
    partialsDir: templateDir
  },
  viewPath: templateDir,
  extName: '.hbs'
};
MiddleTransporter.use('compile' , hbs(handlerBarOptions));

const sendOtpEmail = async (to , subject , template , userName , otp) => {
    try {
        const mailOptions = {
            from : `"Snax Quantum" <${EMAIL_USER}>`,
            to,
            subject,
            template,
            context : {appName : "Snax Quantum" , otp , expiryMinutes: 30, userName , supportEmail:"snaxquantumhelp@gmail.com" , currentYear : 2025 , appShort:"SQ" , companyAddress : "XYZ STREET"}
        };

        const info = await MiddleTransporter.sendMail(mailOptions);
        console.log("Email sent : " , info.messageId);
        return info;
    } catch (error) {
        console.log("Email send failed : " , error.message);
        throw error;
    }
}


const sendPasswordResetMail = async (to , resetLink) => {
    try {
        const mailOptions = {
            from : `"Snax Quantum" <${EMAIL_USER}>`,
            to,
            subject : "Action Required: Reset Your Password",
            template : "PasswordReset",
            context : {resetLink , year : new Date().getFullYear() , appName : "Snax Quantum"}
        };


        const responseInfo = await MiddleTransporter.sendMail(mailOptions);
        console.log("Email sent : " , responseInfo.messageId);

        return responseInfo;
    } catch (error) {
        console.log("[MAILER ERROR] :: " , error)
        throw error;
    }
}

export { 
    sendOtpEmail,
    sendPasswordResetMail
};
