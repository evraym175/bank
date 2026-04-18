
import express from "express";
import { PORT } from "../config/config.service.js";
import cors from "cors"
import helmet from "helmet";
import {rateLimit} from "express-rate-limit"
import successResponse from "./common/utils/success-response/successResponse.js";
import connection_DB from "./DB/connection.DB.js";
import userRouter from "./modules/user/user.controller.js";
import accountRouter from "./modules/bank-account/account.controller.js";
import transactionRouter from "./modules/transaction/transaction.controller.js";



const app = express();

const port = PORT;

const bootstrap = () => {

    const limiter = rateLimit(
        {
            windowMs:60 * 30 * 100,
            limit:20,
            message:"You have exceeded the allowed number of requests. Please try again after a while.",
            requestPropertyName: "rate_limit",
            handler:(req , res ,next)=>
            {
                return successResponse({res , status:409 , message:"Requests limit reached. Try again later."})
            },
            skipFailedRequests:true,
            legacyHeaders:false
        }
    )
    


    app.use(helmet(),limiter)

    app.use(express.json())
    connection_DB()

        app.get("/" , (req , res , next)=>
        {
            successResponse({res , status:200 , message:`welcome on my app ...`})
        })

        app.use("/auth" , userRouter)
        app.use("/accounts" , accountRouter)
        app.use("/transactions" ,transactionRouter)


        app.use("{/*demo}" , (req , res , next)=>
        {
            throw new Error(`Url${req.originalUrl} NOT FOUND` , {cause:404});
        })

        app.use((err , req , res , next)=>
        {
            res.status(err.cause|| 500).json({message:err.message , stack:err.stack})
        })

        app.listen(port, () => {
            console.log(`the server is runnig on port ${port}...`)
        });

}

export default bootstrap;