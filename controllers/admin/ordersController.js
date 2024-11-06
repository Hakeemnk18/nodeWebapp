const Order=require('../../models/ordersSchema')
const orderStatus=require('../../helpers/orderStatusTime')
const { pageNotfound } = require('../user/userController')
const Product=require('../../models/productSchema')
const Wallet=require("../../models/walletSchema")

const orders=async(req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        console.log("page : "+page)
        const limit=5
        const startIndex=limit*(page-1)
        const endIndex=limit*page
        const search=(req.query.search || "").trim();
        const regex = new RegExp(`^${search}`, 'i');

        
        

        const totalOrders=await Order.find().countDocuments().exec()
        const totalPages=Math.ceil(totalOrders/limit)
        
        const data=await Order
        .find()
        .skip(startIndex)
        .limit(limit)
        .sort({orderDate:-1})
        .populate('user')
        .populate('cartItems.product','name')
        .exec()


       


        res.render('allOrders',{
            currentPage:page,
            hasPrevPage:startIndex>0,
            hasNextPage:totalOrders>endIndex,
            data,
            totalPages,
            search,
            page

        })

    } catch (error) {
        console.log("error in admin orders "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const orderDetails=async(req,res)=>{
    try {
        const {id}=req.query
        const data=await Order.findOne({_id:id}).populate("cartItems.product")
        
        res.render('orderDetails',{totalPages :3,data})
    } catch (error) {
        console.log("error in admin order details "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const statusChange=async(req,res)=>{
    try {
        console.log(req.query)
        const {id,status,itemId}=req.query
        await orderStatus.productStaus(status,id,itemId)
        
        
        res.redirect('/admin/orders')
    } catch (error) {
        console.log("error in admin status change"+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

////////////////////////////////////////////////////////////////////////////////////
const returnAccept=async(req,res)=>{
    try {
        console.log("inside return accepet")
        console.log(req.query)
        const{status,id,itemId}=req.query

        
        
        const cartProduct=await Order.findOne({_id:id,"cartItems._id":itemId},{"cartItems.$":1,user:1})
        
        await orderStatus.productStaus(status,id,itemId)




        await Order.findOneAndUpdate({_id:id,"cartItems._id":itemId},
            {$set:{"cartItems.$.returnAccept":"Accept"}}
        )

        const obj = {
            amount: cartProduct.cartItems[0].finalAmount,
            type: 'deposit',
            date: new Date()
        };

        await Wallet.findOneAndUpdate(
            {userId:cartProduct.user},
            {
                $inc:{balance:cartProduct.cartItems[0].finalAmount},
                $push:{transactions: obj}
            }
            
        )

        await Product.findOneAndUpdate(
            {_id:cartProduct.cartItems[0].product,"varient.size":cartProduct.cartItems[0].size},
            {$inc:{"varient.$.stock":cartProduct.cartItems[0].quantity}})


        

        

        return res.redirect('/admin/orders')
    } catch (error) {
        console.log("error in admin return accept "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const orderCancel=async (req,res)=>{
    try {
        
        console.log("inside order cancel")
        console.log(req.query)
        const {id,status,itemId}=req.query
        await orderStatus.productStaus(status,id,itemId)

        const orderData=await Order.findById(id)
        console.log(orderData)
        const cartProduct=await Order.findOne({_id:id,"cartItems._id":itemId},{"cartItems.$":1,user:1})
        console.log(cartProduct)

        if(orderData.paymentMethod === 'COD'){
            if(cartProduct.cartItems[0].walletAmount > 0){

                console.log("inside wallet deduction")
                const obj = {
                    amount: cartProduct.cartItems[0].walletAmount,
                    type: 'deposit',
                    date: new Date()
                };
                await Wallet.findOneAndUpdate(
                    {userId:cartProduct.user},
                    {
                        $inc:{balance:cartProduct.cartItems[0].walletAmount},
                        $push:{transactions: obj}
                    
                    }
                    
                )
            }
        }else if (orderData.paymentMethod === "Razorpay"){
            console.log("inside razorpay")
            const obj = {
                amount: cartProduct.cartItems[0].finalAmount,
                type: 'deposit',
                date: new Date()
            };
            await Wallet.findOneAndUpdate(
                {userId:cartProduct.user},
                {
                    $inc:{balance:cartProduct.cartItems[0].finalAmount},
                    $push:{transactions: obj}
                }
                
            )
        }
       
        await Product.findOneAndUpdate(
            {_id:cartProduct.cartItems[0].product,"varient.size":cartProduct.cartItems[0].size},
            {$inc:{"varient.$.stock":cartProduct.cartItems[0].quantity}})
        
        if(req.query.accept){
            console.log("inside accept")
            await Order.findOneAndUpdate({_id:id,"cartItems._id":itemId},
                {$set:{"cartItems.$.cancelAccept":"Accept"}}
            )
        }else{
            console.log("no request")
        }
        
        
        res.redirect('/admin/orders')
    } catch (error) {
        console.log("error in admin order cancel "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}


const orderReqRej=async(req,res)=>{
    try {
        console.log("rejected")
        const {id,itemId}=req.query
       
        if(req.query.return){

            console.log("return rejected")

            await Order.findOneAndUpdate({_id:id,"cartItems._id":itemId},{$set:{"cartItems.$.returnAccept":"Rejected"}})
           
            
        }else{

            console.log("cancel rejected")
            await Order.findOneAndUpdate({_id:id,"cartItems._id":itemId},{$set:{"cartItems.$.cancelAccept":"Rejected"}})
           
            
        }
        
        res.redirect('/admin/orders')
    } catch (error) {
        console.log("error in admin order req rejected"+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

module.exports={
    orders,
    orderDetails,
    statusChange,
    orderCancel,
    orderReqRej,
    returnAccept
}