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

const productStaus=async(status,id,cartId)=>{
    try {
        
        switch (status){
            case 'Delivered':
                
                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'Delivered',
                        "cartItems.$.statusTimestamps.deliveredAt":new Date()
                    }}   
                )
                break;
            case 'Returned':
                
                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'Returned',
                        "cartItems.$.statusTimestamps.returnedAt":new Date()
                    }}   
                )
                break;
            case 'Cancelled':
                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'Cancelled',
                        "cartItems.$.statusTimestamps.cancelledAt":new Date()
                    }}   
                )
                break;
            case  'outForDelivery' :
                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'outForDelivery',
                        "cartItems.$.statusTimestamps.outForDeliveryAt":new Date()
                    }}   
                )
                break;
            case 'Shipped':
                console.log("inside shipped")
                console.log("status "+status)
                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'Shipped',
                        "cartItems.$.statusTimestamps.shippedAt":new Date()
                    }}   
                )
                break;
            case 'Pending' :
                console.log("inside pending")
                console.log("status "+status)
                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'Pending',
                        "cartItems.$.statusTimestamps.pendingAt":new Date()
                    }}   
                )
                break;
            case 'Processing' :

                await Order.findOneAndUpdate(
                    {_id:id,"cartItems._id":cartId},
                    {$set:{
                        "cartItems.$.orderStatus":'Processing',
                        "cartItems.$.statusTimestamps.processingAt":new Date()
                    }}   
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