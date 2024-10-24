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
    },
    offer: {
        type: { type: String, enum: ['percentage', 'flat'], required: false }, 
        value: { type: Number, default: 0 }, 
        startDate: Date,
        endDate: Date,
    },
},{
    timestamps:true
})

const category=mongoose.model("category",categorySchema)

module.exports=category








