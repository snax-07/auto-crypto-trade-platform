import mongoose from 'mongoose'
import { DB_URL } from './secretEnv.js';

const connectionManagement = {};
async function dbConnect(){
    if(connectionManagement.isConnected){
        console.log("Database is already connected  !!!");
        return;
    }
    try {

        const dbConnec = await mongoose.connect(DB_URL);
        connectionManagement.isConnected = dbConnec.connection.readyState;
        
        console.log("connected to database !!!");
    } catch (error) {
        console.log("error while connecting database !!!");
        process.exit();
    }
}

export default dbConnect;