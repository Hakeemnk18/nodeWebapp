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
    productImage: [
        {
            path: {
                type: String,
                required: true
            },
            filename: {
                type: String,
                required: true
            }
        }
    ],
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
        ref:"rating"
    },
    price:{
        type:Number,
        required:true
    }
},{timestamps:true})

const product=mongoose.model("product",productSchema)

module.exports=product