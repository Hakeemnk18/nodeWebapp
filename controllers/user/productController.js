const Product=require('../../models/productSchema')
const Category=require('../../models/category')
const Cart=require('../../models/cartSchema')
const User=require('../../models/userSchema')
const app = require('../../app')
const product = require('../../models/productSchema')
const Order=require('../../models/ordersSchema')
const isUser=require('../../helpers/isUserlogin')
const statusTime=require('../../helpers/orderStatusTime')

const productDetails=async (req,res)=>{
    try {
        
        const {id}=req.query
        
        let userName=await isUser.isUser(req)
        const productData=await Product.findOne({_id:id})
        const relatedProduct=await Product.find({category:productData.category})
        const color=await Product.aggregate([
            {$match:{name:productData.name}},
            {$unwind:"$varient"},
            {$group:{_id:"$varient.color"}}
            
        ])

        const size=await Product.aggregate([
            {$match:{name:productData.name}},
            {$unwind:"$varient"},
            {$group:{_id:"$varient.size"}}
        ])
        
        if(req.session.user_id){
            logout="logout"
        }
        

        
        
    
        res.render('productDetails',{productData,relatedProduct,color,logout,size})
    } catch (error) {
       console.log("error in product details page "+error.message) 
       return res.status(400).json({success:false,message:"an error occured"})
    }
}

const addCart=async(req,res)=>{
    try {
        
        let logout;
        
        const {id,quantity}=req.query
        const userId=req.session.user_id
        if(req.session.user_id){
            logout="logout"
        }

        for(let i=0;i<quantity;i++){
            const newCart=new Cart({
                userId:userId,
                productId:id
            }) 
            const cartData=await newCart.save()
        }
        
        await Product.updateOne({_id:id},{$inc:{"varient.0.stock":-quantity}})
        res.redirect('/productDetails/cart')
        

    } catch (error) {
        console.log("error in addCart "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const removeCart=async(req,res)=>{
    try {
        const {id}=req.query
        const userId=req.session.user_id
        if(req.query.qty){
            await Cart.deleteMany({productId:id,userId:userId})
            await Product.updateOne({_id:id},{$inc:{"varient.0.stock":req.query.qty}})
        }else{
            await Cart.deleteOne({productId:id,userId:userId})
            await Product.updateOne({_id:id},{$inc:{"varient.0.stock":1}})
        }
        res.redirect('/productDetails/cart')

    } catch (error) {
        console.log("error in remove cart "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const cart=async(req,res)=>{
    try {

        const userId=req.session.user_id
        let userName=await isUser.isUser(req)
        const allCart=await Cart.find({userId:userId})
       

        const productCount=allCart.reduce((acc,cart)=>{
            acc[cart.productId]=(acc[cart.productId]||0)+1
            return acc
        },{})

        const productIds = Object.keys(productCount);
        let cartProduct = await Product.find({ _id: { $in: productIds } });

        cartProduct=cartProduct.map(product =>

            ({...product._doc,count:productCount[product._id]})

        )
        
        
        console.log(cartProduct.length>0)
        
        res.render('addtoCart',{cartProduct,userName})
        
    } catch (error) {
        console.log("error in cart "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const allProduct=async (req,res)=>{

    try {

        
        console.log(req.query)
        const page=parseInt(req.query.page )|| 1
        
        const {sort}= req.query
        const search=(req.query.search || '').trim();
        const regex=new RegExp(`^${search}`,'i');
        const query = { isActive: true, name: { $regex: regex } };
        
        let categoryFillter=req.query.filter
        if(categoryFillter){
            categoryFillter=categoryFillter.trim()
            query.category=categoryFillter
            console.log("category filter : "+categoryFillter)
            
        }
        

        console.log(query)


        const category=await Category.find()
        

        const limit=6
        const startIndex=(page-1)*limit
        const endIndex=page*limit

        let userName=await isUser.isUser(req)
       

        const productCount=await Product.find(query).countDocuments()

        let sortCriteria={}
        if(sort === 'lowtohigh'){
            sortCriteria={price:1}
        }else if(sort === "hightolow"){
            sortCriteria={price:-1}
        }else if(sort === "A to Z"){
            sortCriteria = {name:1}
        }else if(sort === "Z to A"){
            sortCriteria = {name:-1}
        }else if(sort === "New Arrivals"){
            sortCriteria = {createdAt :-1}
        }
        
        const allProduct=await Product.find(query)
        .sort(sortCriteria)
        .limit(limit)
        .skip(startIndex)
        .exec()

        const totalPages=Math.ceil(productCount/limit) 
        

        res.render('allProduct',{
            allProduct,
            currentPage:page,
            hasNextPage:endIndex < productCount,
            hasPrevPage:startIndex >0,
            totalPages,
            sort,
            search,
            userName,
            cart,
            category
        })
        
    } catch (error) {
        console.log("error in allproduct "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const checkout=async(req,res)=>{
    try {
        let userName=await isUser.isUser(req)
        const userId=req.session.user_id
        const user=await User.findById(userId).populate({path:'address',match:{isActive:true}}).exec()
        const userCart=await Cart.find({userId:userId})
        const productCount=userCart.reduce((acc,cur)=>{
            acc[cur.productId]=(acc[cur.productId] || 0)+1
            return acc
        },{})
        const productIds=Object.keys(productCount)
        let cartProduct=await Product.find({_id:{$in:productIds }})
        cartProduct=cartProduct.map((product)=>{
            return {...product._doc,count:productCount[product._id]}
        })
        if(cartProduct.length === 0){
            return res.redirect('/products')
        }
        res.render('checkout',{userName,cartProduct,addresses:user.address})
    } catch (error) {
        console.log("error in checkout "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

    function generateUniqueOrderId() {
        const prefix = 'ORD'; // You can customize the prefix
        const timestamp = Date.now(); // Current timestamp
        const randomChars = Math.random().toString(36).substr(2, 5).toUpperCase(); // Generate 5 random characters
    
        return `${prefix}-${timestamp}-${randomChars}`;
    }


/////////////////////////////////////////////////////////////////////////////////////

const orderSubmission=async(req,res)=>{
    try {

        
        const {productIds,productQty,productPrice,address,totalAmount}=req.body
        
        const productDetails=[]
        for(let i=0;i<productIds.length;i++){
            productDetails.push({product:productIds[i],quantity:productQty[i],price:productPrice[i]})
        }
        const orderId=generateUniqueOrderId()
       
        const user_id=req.session.user_id
        const order=new Order({
            user:user_id,
            cartItems:productDetails,
            address:address,
            totalPrice:totalAmount,
            orderId:orderId
        })
        const orderData=await order.save()
        
        await statusTime.statusTime(orderData.orderStatus,orderData._id)
        const uorderData = await Order.findById(orderData._id);
        console.log(uorderData)
        await Cart.deleteMany({userId:user_id})
        res.redirect('/productDetails/cart/checkout/success')

    } catch (error) {
        console.log("error in order submition "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const orderSuccess=async(req,res)=>{
    try {
        let userName=await isUser.isUser(req)
        res.render("orderSuccess",{userName})
    } catch (error) {
        console.log("error in order success "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
module.exports={
    productDetails,
    addCart,
    allProduct,
    cart,
    removeCart,
    checkout,
    orderSubmission,
    orderSuccess
}



