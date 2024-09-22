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
    description:{
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
    
    croppedImage:[String],
    
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
        ref:"Rating"
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type: Schema.Types.ObjectId, 
        ref: 'Category'
        
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const product=mongoose.model("product",productSchema)

module.exports=product
