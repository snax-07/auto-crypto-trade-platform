import express from 'express'
import cors from 'cors'
import userRouter from './routes/user.routes.js'
import { PORT } from './utils/secretEnv.js';
import cookieParser from 'cookie-parser'
import botRouter from './routes/automationBot.routes.js';
const app = express();


app.use(express.json())
app.use(cors({
    origin : 'http://localhost:3000',
    credentials: true
}))
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());


//User Routes
app.use('/api/v1',userRouter);
app.use('/api/v1/exchange' , userRouter)
app.use('/api/v1/order' , userRouter)

//Automation Routes / BOT Routes
app.use('/api/v1/bot' , botRouter);

app.listen(PORT , () => console.log(`server is running on ${process.env.PORT} `));