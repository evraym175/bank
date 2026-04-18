import mongoose from "mongoose"
import { DB_URI_LOCAL } from "../../config/config.service.js"

const connection_DB = async ()=>
    {
        try {
        await mongoose.connect(DB_URI_LOCAL , {serverSelectionTimeoutMS:5000})  
        console.log(`Connected successfully to server${DB_URI_LOCAL}..❤️`); 
            
        } catch (error) {
            console.error('sync to connect to the database.......', error);
        }
    } 
    export default connection_DB