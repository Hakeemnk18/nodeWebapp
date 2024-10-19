const Order=require('../../models/ordersSchema')
const orderStatus=require('../../helpers/orderStatusTime')
const { pageNotfound } = require('../user/userController')
const Product=require('../../models/productSchema')

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
        console.log(data)
        res.render('orderDetails',{totalPages :3,data})
    } catch (error) {
        console.log("error in admin order details "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const statusChange=async(req,res)=>{
    try {
        console.log(req.query)
        const {id,status}=req.query
        await Order.findByIdAndUpdate(id,{$set:{orderStatus:status}})
        await orderStatus.statusTime(status,id)
        const orderData=await Order.findById(id)
        // console.log(orderData)
        res.redirect('/admin/orders')
    } catch (error) {
        console.log("error in admin status change"+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const orderCancel=async (req,res)=>{
    try {
        console.log("inside admin order cancel")
        const {id,status}=req.query
        await Order.findByIdAndUpdate(id,{$set:{orderStatus:status}})
        await orderStatus.statusTime(status,id)
        const orderData=await Order.findById(id)
        console.log(orderData)
        for(let i=0;i<orderData.cartItems.length;i++){
            await Product.updateOne({_id:orderData.cartItems[i].product,"varient.size":orderData.cartItems[i].size},{$inc:{"varient.$.stock":orderData.cartItems[i].quantity}})
            const product=await Product.findById(orderData.cartItems[i].product)
            //await Product.updateOne({_id:productId,"varient.size":size},{$inc:{"varient.$.stock":1}})
        }
        
        res.redirect('/admin/orders')
    } catch (error) {
        console.log("error in admin order cancel"+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const orderReqRej=async(req,res)=>{
    try {
        const {id}=req.query
        const data=await Order.findByIdAndUpdate(id,{$set:{accept:'reject'}},{new:true})
        console.log(data)
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
    orderReqRej
}