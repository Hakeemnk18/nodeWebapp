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
            },
            isReturn:{
                type:Boolean,
                default:false
            },
            accept:{
                type:String,
                enum:['accept','reject'],
                default:'accept'
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
        enum: ['Pending', 'Processing', 'Shipped','outForDelivery', 'Delivered', 'Cancelled','Returned'],
        default: 'Pending'
    }, 
    statusTimestamps: {
        pendingAt: { type: Date },          
        processingAt: { type: Date },       
        shippedAt: { type: Date },          
        outForDeliveryAt: { type: Date },  
        deliveredAt: { type: Date },        
        cancelledAt: { type: Date },       
        returnedAt: { type: Date }          
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

    },
    accept:{
        type:String,
        enum:['accept','reject'],
        default:'accept'
    }

})

const Order=mongoose.model("order",ordersSchema)

module.exports=Order
