import dotenvFlow from 'dotenv-flow'
import { fileURLToPath } from 'url'
import path from 'path'

/* This snippet is used when your .env , .env.local , .env.devlopment , .env.share, etc. is mainly located in the
another dir */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenvFlow.config({
    path : path.resolve(__dirname , "../../../shared/config")
})




/* This snippet is used for the you have all env in same root folder just use the dotenvflow 
and for your dev it will get from the root folder */

dotenvFlow.load();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const DB_URL = process.env.DB_URL;
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS;
const EMAIL_USER = process.env.EMAIL_USER;
const orchServer = "orchservice"



export {
    PORT,
    JWT_REFRESH_SECRET,
    JWT_SECRET,
    DB_URL,
    BCRYPT_SALT_ROUNDS,
    EMAIL_USER,
    orchServer
}