const mongoose=require('mongoose')
const {Schema}=mongoose


const variantSchema=new Schema({
    size:{
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
})

const productSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    productImage:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    offerId:{
        type:Schema.Types.ObjectId,
        ref:"offers"
    },
    varient:{
        type:[variantSchema],
        required:true
    },
    rating:{
        type:Schema.Types.ObjectId,
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    createdAt:{
        type:Date,
        default:Date.now
    }



})

const product=mongoose.model("product",productSchema)

module.exports=product