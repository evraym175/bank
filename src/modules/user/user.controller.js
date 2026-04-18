import { Router } from "express";
import * as US from "./user.service.js"
import * as UV from "./user.validation.js"
import validation from "../../common/middleware/validation.js";

const userRouter = Router()

userRouter.post("/register" ,validation(UV.signUpSchema) ,US.register)
userRouter.post("/login" ,validation(UV.loginSchema) ,US.login)

export default userRouter