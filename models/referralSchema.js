const mongoose=require('mongoose')
const {Schema}=mongoose

const referralSchema=new Schema({
    bonus:{
        type:Number,
        default:0
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const referral=mongoose.model("referral",referralSchema)

module.exports=referral