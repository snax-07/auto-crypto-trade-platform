import { Router } from "express";
import verifyToken from "../utils/middleware-auth.js";
import { allCandlesSpot } from "../controllers/candle.js";

const candleRoute =  Router();

candleRoute.route('/allSpotCandles').get( allCandlesSpot)


export default candleRoute