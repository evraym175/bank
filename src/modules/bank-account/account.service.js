import successResponse from "../../common/utils/success-response/successResponse.js";
import bankAccountModel from "../../DB/models/bankAccount.model.js";
import * as db_service from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js";



export const addData = async (req , res , next)=>
{
    const {currency , balance , accountNumber , userId}= req.body

    const accountUser = await db_service.findOne({
        model:userModel,
        check:{userId:req.user._id}
    })
    
    if(!accountUser)
    {
        throw new Error("Please create an account." ,{cause:409});
    }

    const createAccount = await db_service.create({
        model:bankAccountModel,
        data:{
            userId: req.user._id,
            accountNumber,
            balance,
            currency
        }
    })

    successResponse({res , data:createAccount})

}

export const getMyAccountm = async (req, res, next) => {
    const account = await bankAccountModel.findOne({
        userId: req.user._id
    });

    if (!account) {
        throw new Error("Account not found", { cause: 404 });
    }

    successResponse({ res, data: account });
};