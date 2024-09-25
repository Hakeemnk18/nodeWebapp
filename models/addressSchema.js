const mongoose=require("mongoose");

const {Schema}=mongoose

const addressSchema=new Schema({
    houseNumber:{
        type:Number,
        required:true,
    },
    street:{
        type:String,
        required:true
    },
    village:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    country:{
        type:String,
        require:true
    },
    isDefault:{
        type:Boolean,
        default:false
    }
})

const address= mongoose.model("address",addressSchema)

module.exports=address