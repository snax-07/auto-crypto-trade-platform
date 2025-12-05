import rateLimit from 'express-rate-limit'


const botRateLimiterContext = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,                 
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

const loginRateLimiterContext = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 100,                 
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

const signUpRateLimiterContext = rateLimit({
    windowMs: 60 * 1000, 
    max: 5,                 
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

const globalRateLimiterContext = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,                 
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

const tradeRateLimiterContext = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,                 
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});



export  {botRateLimiterContext , loginRateLimiterContext , signUpRateLimiterContext , globalRateLimiterContext , tradeRateLimiterContext};