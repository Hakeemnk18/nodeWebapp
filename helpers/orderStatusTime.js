const Order=require('../models/ordersSchema')


const statusTime=async(status,id)=>{
    try {
        
        switch (status){
            case 'Pending' :
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.pendingAt":new Date()}},{upsert:true})
                break;
            case 'Processing' :
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.processingAt":new Date()}},{upsert:true})
                break;
            case 'Shipped':
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.shippedAt":new Date()}},{upsert:true})
                break;
            case  'outForDelivery' :
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.outForDeliveryAt":new Date()}},{upsert:true})
                break;
            case  'Delivered':
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.deliveredAt":new Date()}},{upsert:true})
                break;
            case 'Cancelled':
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.cancelledAt":new Date()}},{upsert:true})
                break;
            case 'Returned':
                await Order.findByIdAndUpdate(id,{$set:{"statusTimestamps.returnedAt":new Date()}},{upsert:true})
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