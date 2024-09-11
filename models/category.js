const mongoose=require('mongoose')
const {Schema}=mongoose

const categorySchema=new Schema({
    categoryName:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})

const category=mongoose.model("category",categorySchema)

module.exports=category








