import mongoose from "mongoose";
import { rolesEnum } from "../../common/enum/user.enum.js";


const userSchema = new mongoose.Schema({

        firstName:
        {
            type:String,
            required:true,
            trim:true,
            minLength:3,
            maxLength:20
            
        },
        lastName:
        {
            type:String,
            required:true,
            trim:true,
            minLength:3,
            maxLength:20
        },
        email:
        {
            type:String,
            required:true,
            unique:true,
            trim:true,
        },
        password:
        {
            type:String,
            required:true,
            trim:true,
            minLength:7,
        },
            roles:{
            type:String,
            enum:Object.values(rolesEnum),
            default:rolesEnum.user
        },
},
    {
        timestamps:true,
        strictQuery:true,
        toJSON:{virtuals:true},
    }
)

userSchema.virtual("fullName")
.get(function()
{
    return this.firstName + " " + this.lastName
})
.set(function (v)
{
this.firstName = v.split(" ")[0]
this.lastName = v.split(" ")[1]
})

const userModel = mongoose.models.user || mongoose.model("user" , userSchema)

export default userModel