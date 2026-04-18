
import { GeneralRules } from "../../common/utils/generalRuels.js";
import joi from "joi"
export const addAccountSchema = {
    body:joi.object(
    {
        userId:GeneralRules.userId.required(),
        accountNumber: joi.number(),
        balance: joi.number(),
        currency: joi.string().default("EGP")

    }).required(),
}