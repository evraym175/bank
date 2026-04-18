
import { ACCESS_SEUCRIT_KEY, REFRESH_SEUCRIT_KEY } from "../../../config/config.service.js"
import { bcryptPssword, comparePssword } from "../../common/utils/security/hash.security.js"
import successResponse from "../../common/utils/success-response/successResponse.js"
import { generateToken } from "../../common/utils/token/token.service.js"
import * as db_service from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js"
import { randomUUID} from "crypto";

export const register = async(req , res , next)=>
{
    const {fullName, email , password  , cPassword, userId} = req.body

        if(password !== cPassword){
    throw new Error("password is ValIde")
}

if(await db_service.findOne({model:userModel , check:{
    _id:userId ,
    
    }})){
    throw new Error("User NOT F0UND" , {cause:404})
}

    const user = await db_service.create({

        model:userModel,
        data:{fullName,
            email , 
            password:bcryptPssword({textPlan:password}),
            
        }
    })

    successResponse({res ,data:user})
}

export const login = async(req , res,next)=>
{
    const { email , password} = req.body
    const user = await db_service.findOne({model:userModel , check:{email ,
        confirmed: {$exists: true}
    }})
    if(!user)
    {
        throw new Error("Emali Already Exist or provider is not system" , {cause:403});
    }

    if(! comparePssword({textPlan:password , cipertext: user.password}))
    {
        throw new Error("InValid Password" , {cause:409});
    }

    const jwtid = randomUUID()
    const access_token = generateToken({paylod:{userId : user._id} , 
        seucrit:ACCESS_SEUCRIT_KEY,
        options:{
            expiresIn : "1h", 
            issuer:"http://localhost:3001",
            audience:"http://localhost:4000",
            jwtid
    }})

    const refresh_token = generateToken({paylod:{userId:user._id},
        seucrit:REFRESH_SEUCRIT_KEY,
        options:{
            expiresIn:"1y",
            jwtid
        }})
    successResponse({res , data:{access_token , refresh_token}})
}