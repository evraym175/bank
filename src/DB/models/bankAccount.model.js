import mongoose from "mongoose";
import { statusEnum } from "../../common/enum/bankAccount.enum.js";

const bankAccountSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    accountNumber: {
        type: Number,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: "EGP"
    },
    status: {
        type: String,
        enum:Object.values(statusEnum),
        default:statusEnum.active
        
    }
}, 
{ 
    timestamps: true,
    strictQuery:true,
    toJSON:{virtuals:true},

});

const bankAccountModel = mongoose.models.account || mongoose.model("account" , bankAccountSchema)

export default bankAccountModel