import dbConnect from "./dbConnect.js";

const authoriseBotInit = async (req , res , next) => {
    try {
        await dbConnect();

        const isVerified = req.user?.isVerified;
        if(!isVerified) return res.status(403).json({
            message : "User is not verified !!!"
        });

        next();
        

    } catch (error) {
        return res.status(500).json({
            message : "User is not verified for creating the bot !!!",
            error : error
        })
    }
};


export default  authoriseBotInit;