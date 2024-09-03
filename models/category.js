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
    }
},{
    timestamps:true
})

const category=mongoose.model("category",categorySchema)

module.exports=category








