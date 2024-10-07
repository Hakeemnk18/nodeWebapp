const mongoose=require('mongoose')
const product = require('./productSchema')
const {Schema}=mongoose

const ordersSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    cartItems:[
        {
            product:{
                type:Schema.Types.ObjectId,
                ref:"product",
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    address:{
        type:Schema.Types.ObjectId,
        ref:'address',
        required:true
    },
    payment:{
        type:String,
        default:"cash on delivery"
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }, 
    orderDate:{
        type:Date,
        default:Date.now()
    },
    totalPrice:{
        type:Number,
        required:true
    },
    orderId:{
        type:String,
        required:true
    },
    isReturn:{
        type:Boolean,
        default:false

    }

})

const Order=mongoose.model("order",ordersSchema)

module.exports=Order
