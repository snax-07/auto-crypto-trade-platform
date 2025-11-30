import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './secretEnv.js';

const verifyToken = (req , res , next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || req.cookies?.accessToken;


        if(!token){
            return res.status(401).json({ message: "Not Authenticated: No token provided" });
        }

        jwt.verify(token , JWT_SECRET , (err , decoded) => {
            if(err){
                if(err.name === 'TokenExpiredError'){
                    return res.status(401).json({ message: 'Token Expired' });
                }
                return res.status(401).json({ message: 'Invalid Token' });
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        return res.status(500).json({ message: "Error while authenticating", error: error.message });
    }
}


export default verifyToken;