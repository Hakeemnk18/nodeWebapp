const Order=require('../models/ordersSchema')


const statusTime=async(status,id)=>{
    try {
        
         
        switch (status){
            case 'Pending' :
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        
                        "cartItems.$[].statusTimestamps.pendingAt":new Date()
                     } } )
                break;
            case 'Processing' :

                     
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        "cartItems.$[].orderStatus": 'Processing',
                        "cartItems.$[].statusTimestamps.processingAt":new Date()
                     } } )
                break;
            case 'Shipped':
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        "cartItems.$[].orderStatus": 'Shipped',
                        "cartItems.$[].statusTimestamps.shippedAt":new Date()
                     } } )
                break;
            case  'outForDelivery' :
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        "cartItems.$[].orderStatus": 'outForDelivery',
                        "cartItems.$[].statusTimestamps.outForDeliveryAt":new Date()
                     } } )
                break;
            case  'Delivered':
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        "cartItems.$[].orderStatus": 'Delivered',
                        "cartItems.$[].statusTimestamps.deliveredAt":new Date()
                    } } )
                break;
            case 'Cancelled':
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        "cartItems.$[].orderStatus": "Cancelled",
                        "cartItems.$[].statusTimestamps.cancelledAt":new Date()
                    } } )
                break;
            case 'Returned':
                await Order.findByIdAndUpdate(id,
                    { $set: { 
                        "cartItems.$[].orderStatus": 'Returned',
                        "cartItems.$[].statusTimestamps.returnedAt":new Date()
                    } } )
                break;
            default:
                console.log("no status matched")
        }
    } catch (error) {
        console.log("error in statuse time stapm "+error.message)
    }
}

const productStaus=async(status,id)=>{
    try {
        
        switch (status){
            case 'Delivered':
                console.log("inside switch delivered ")
                await Order.findByIdAndUpdate(
                    id,
                    {$set:{
                        'cartItems.$[].status':'Delivered',
                        'cartItems.$[].productStatusTimeStamp.deliveredAt':new Date()
                    }},
                    
                )
                break;
            case 'Returned':
                console.log("inside switch delivered")
                await Order.findByIdAndUpdate(
                    id,
                    {$set:{
                        'cartItems.$[].status':'Returned',
                        'cartItems.$[].productStatusTimeStamp.returnedAt':new Date()
                    }},
                    
                )
                break;
            default:
                console.log("no status matche for cart items")
        }
    } catch (error) {
        console.log("error in statuse time stapm for cart items "+error.message)
    }
}

module.exports={
    statusTime,
    productStaus
}