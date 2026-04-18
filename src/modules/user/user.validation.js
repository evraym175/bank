import { GeneralRules } from "../../common/utils/generalRuels.js";
import joi from "joi"

export const signUpSchema = {
    body:joi.object(
    {
        fullName:GeneralRules.userName.required(),
        email:GeneralRules.email.required(),
        password:GeneralRules.password.required(),
        cPassword:GeneralRules.cPassword.required(),

    }).required(),
}

export const loginSchema = {
    body:joi.object(
    {
        email:GeneralRules.email.required(),
        password:GeneralRules.password.required(),
    }).required(),
}