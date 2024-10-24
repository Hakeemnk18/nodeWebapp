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
    offer: {
        type: { type: String, enum: ['percentage', 'flat'], required: false }, 
        value: { type: Number, default: 0 }, 
        startDate: Date,
        endDate: Date,
    },
    
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
