const mongoose=require('mongoose')
const{Schema}=mongoose

const userSchema=new Schema({
    firstName:{
        type:String,
        
    },
    lastName:{
        type:String,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,

    },
    googleId: {
        type: String,
        unique: true
    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    role:{
        type:String,
        enum:["admin","user"],
        required:true,
        default:"user"
    },
    address:[{
        type:Schema.Types.ObjectId,
        ref:"address"
    }],
    profile: {
        type: String, 
       
    },
    // createdAt: {
    //     type: Date,
    //     default: Date.now   
    // },
    // updatedAt:{
    //     type: Date,
    //     default: Date.now   
    // }
},{
    timestamps:true
})

const user=mongoose.model("user",userSchema);

module.exports=user