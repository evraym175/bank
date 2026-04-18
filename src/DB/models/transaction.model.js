import mongoose from "mongoose";
import { TstatusEnum, typeEnum } from "../../common/enum/transaction.enum.js";

const transactionSchema = new mongoose.Schema({
    accountId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    type: {
        type: String,
        enum:Object.values(typeEnum),
        default:typeEnum.deposit
    },
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    amount: {
        type: Number,
        required: true
    },
    balanceBefore: Number,
    balanceAfter: Number,
    status: {
        type: String,
        enum:Object.values(TstatusEnum),
        default:TstatusEnum.completed
    }
}, {
    timestamps: true,
    strictQuery:true,
    toJSON:{virtuals:true},
});

const transactionModel = mongoose.models.transaction || mongoose.model("transaction" , transactionSchema)

export default transactionModel