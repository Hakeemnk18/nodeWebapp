const mongoose=require('mongoose')
const{Schema}=mongoose

const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,

    },
    phoneNumber:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    address:{
        type:Schema.Types.ObjectId,
        ref:"address"
    },
    profile: {
        type: String, 
        required: false 
    },
    createdAt: {
        type: Date,
        default: Date.now 
    },
    updatedAt:{
        type: Date,
        default: Date.now   
    }
})

const user=mongoose.model("user",userSchema);

module.exports=user