import e from "express";
import { RegisterUser  , LoginUser , test, exchangeCredentials, removeExchangeCredential, updateExchangeCredentials, getAllCredentials, verifyOtp, forgeMarketTrade, intiResetPassword, resetPassword, returnMe, setReferralCode, getAllOrders, logout, updateInfo, updateVerifier, changePassword, update2FA} from "../controllers/user.controller.js";
import verifyToken from "../utils/middleware-auth.js";
import authoriseBotInit from "../utils/botAuthoriser.js";
import { loginRateLimiterContext, signUpRateLimiterContext } from "../utils/rateLimiter.js";

const router = e.Router();

router.route('/register').post(signUpRateLimiterContext , RegisterUser);
router.route('/login' ).post( loginRateLimiterContext, LoginUser);
router.route('/digi-verify').post(verifyOtp);
router.route('/resetLink').post(intiResetPassword); 
router.route('/reset-password').post(resetPassword);
router.route('/logout').get(logout);



//PROTECTED ROUTES
router.route('/test').post(verifyToken , test);


router.route('/add').post(verifyToken , exchangeCredentials);
router.route('/delete-cred').post(verifyToken , removeExchangeCredential);
router.route('/update/:exchangeId').post(verifyToken , updateExchangeCredentials);
router.route('/getCred').get(verifyToken , getAllCredentials);
router.route('/getHistory').get(verifyToken , getAllOrders)

router.route('/referral').post(verifyToken , setReferralCode);
router.route('/me').get(verifyToken , returnMe);
router.route('/update-request').post(verifyToken , updateInfo);
router.route('/verify-update').post(verifyToken , updateVerifier);
router.route('/chgPass').post(verifyToken , changePassword);
router.route('/update-2fa').post(verifyToken , update2FA);

//PROTECTED AND TRADE ROUTES BOT
router.route('/create').post(verifyToken ,forgeMarketTrade);


export default router