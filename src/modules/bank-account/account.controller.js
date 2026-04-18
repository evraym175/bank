import { Router } from "express";
import * as AS from "./account.service.js"
import * as AV from "./account.validation.js"
import { authentication } from "../../common/middleware/authentication.js";
import validation from "../../common/middleware/validation.js";

const accountRouter=Router()

accountRouter.post("/add-account" , validation(AV.addAccountSchema),authentication, AS.addData)
accountRouter.get("/me" ,authentication , AS.getMyAccountm)

export default accountRouter