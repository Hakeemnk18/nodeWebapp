const Order=require('../../models/ordersSchema')
const { pageNotfound } = require('../user/userController')

const orders=async(req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        console.log("page : "+page)
        const limit=2
        const startIndex=limit*(page-1)
        const endIndex=limit*page
        const search=(req.query.search || "").trim();
        const regex = new RegExp(`^${search}`, 'i');

        
        

        const totalOrders=await Order.find().countDocuments().exec()
        const totalPages=Math.floor(totalOrders/limit)

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

module.exports={
    orders,
    orderDetails
}