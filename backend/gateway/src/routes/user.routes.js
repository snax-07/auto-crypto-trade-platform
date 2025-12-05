import e from "express";
import { RegisterUser  , LoginUser , test, exchangeCredentials, removeExchangeCredential, updateExchangeCredentials, getAllCredentials, verifyOtp, forgeMarketTrade, intiResetPassword, resetPassword} from "../controllers/user.controller.js";
import verifyToken from "../utils/middleware-auth.js";
import authoriseBotInit from "../utils/botAuthoriser.js";
import { loginRateLimiterContext, signUpRateLimiterContext } from "../utils/rateLimiter.js";

const router = e.Router();

router.route('/register').post(signUpRateLimiterContext , RegisterUser);
router.route('/login' ).post( loginRateLimiterContext, LoginUser);
router.route('/digi-verify').post(verifyOtp);
router.route('/resetLink').post(intiResetPassword); 
router.route('/reset-password').post(resetPassword);


//PROTECTED ROUTES
router.route('/test').post(verifyToken , test);
router.route('/add').post(verifyToken , exchangeCredentials);
router.route('/delete-cred').post(verifyToken , removeExchangeCredential);
router.route('/update/:exchangeId').post(verifyToken , updateExchangeCredentials);
router.route('/getCred').get(verifyToken , getAllCredentials);


//PROTECTED AND TRADE ROUTES
router.route('/create').post(verifyToken , authoriseBotInit,forgeMarketTrade);


export default router