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
            cartId:{
                type:Schema.Types.ObjectId,
                ref:"cart",
                required:true
            },
            isReturn:{
                type:Boolean,
                default:false
            },
            isAccept:{
                type:Boolean,
                
            },
            size:{
                type:String,
                required:true
            },
            productStatusTimeStamp:{
               returnedAt:{type:Date}
            },
            offerPrice:{
                type:Number
            },
            walletAmount:{
                type:Number
            }
        }
    ],
    address:{
        type:Schema.Types.ObjectId,
        ref:'address',
        required:true
    },
    paymentMethod:{
        type:String,
        enum:["COD","Razorpay"],
        default:"COD"
    },
    paymentStatus:{
        type:String,
        enum:['Pending','Success','Failed']
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
    },
    walletUsed:{
        type:Boolean,
        default:false
    },
    couponAmount:{
        type:Number
    },
    walletAmount:{
        type:Number
    },
    offerPrice:{
        type:Number
    },
    payedAmount:{
        type:Number
    }

})

const Order=mongoose.model("order",ordersSchema)

module.exports=Order
