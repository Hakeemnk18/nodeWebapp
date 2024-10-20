const Product=require('../../models/productSchema')
const Category=require('../../models/category')
const Cart=require('../../models/cartSchema')
const User=require('../../models/userSchema')
const app = require('../../app')
const product = require('../../models/productSchema')
const Order=require('../../models/ordersSchema')
const isUser=require('../../helpers/isUserlogin')
const statusTime=require('../../helpers/orderStatusTime')
const Wishlist=require('../../models/wishlistSchema')
const wishlist = require('../../models/wishlistSchema')


// find stock according to the size
async function findStock(id,size){
    try {
        console.log("inside find stock")
        const product=await Product.findOne({_id:id},{varient:1,_id:0})
        console.log(product)
        const variant=product.varient.find(v => v.size === size)
        console.log(variant)
        console.log(variant.stock)
        return variant.stock
    } catch (error) {
        console.log("error in find stock"+error.message)
    }
}



const productDetails=async (req,res)=>{
    try {
        
        const {id}=req.query
        let message;
        if (req.query.message) {
            message = req.query.message;
        }
        
        let userName=await isUser.isUser(req)
        const productData=await Product.findOne({_id:id})
        const relatedProduct=await Product.find({category:productData.category})
        
        
        
        
    
        res.render('productDetails',{productData,relatedProduct,userName,message})
    } catch (error) {
       console.log("error in product details page "+error.message) 
       return res.status(400).json({success:false,message:"an error occured"})
    }
}
const stockDetails=async(req,res)=>{
    try {
        
        
        const {id,size}=req.query
        
       
        const stock=await findStock(id,size)
        
        res.json({stock})
    } catch (error) {
        console.log("error in stock fetching page "+error.message)
        res.status(404).json({ error: 'Product not found or index out of range' })
    }
}


const addCart=async(req,res)=>{
    try {
        
        let logout;
        
        console.log(req.query)
        
        const {id,quantity}=req.query
        const sizeVal=req.query.size
        const userId=req.session.user_id

        if(req.query.remove){
            await Wishlist.deleteOne({productId:id,size:sizeVal,userId:userId})
            console.log("delete one product in wishlist")
        }
        const stock=await findStock(id,sizeVal)
        
        
        const productData=await Product.findById(id)
        
        
        if(stock < quantity){
            console.log("stock is empty")
            return res.redirect(`/productDetails?id=${id}`);
        }
        const size=sizeVal
        
        
        const cart=await Cart.find({userId:userId})

        let flag=0
        
        if(cart.length > 0){
            for(const carts of cart){
        
                if(carts.productId == id && carts.size === size){
                    console.log("a cart avaliable just increase the quntity")
                    await Cart.updateOne({userId:userId,productId:id,size:size},{$inc:{quantity:quantity}})
                    flag=1

                }
                
            }
        }
        if(cart.length < 1 || flag === 0){
            const newCart=new Cart({
                        userId:userId,
                        productId:id,
                        size:size,
                        quantity:quantity
            })
            const cartData=await newCart.save()
        }
        
        
        const pppp=await Product.findById(id)
        
        await Product.updateOne({_id:id,"varient.size":size},{$inc:{"varient.$.stock":-quantity}})
        
        const ppp=await Product.findById(id)
        

        res.redirect('/productDetails/cart')
        

    } catch (error) {
        console.log("error in addCart "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const updateCartQty=async(req,res)=>{
    try {
        const {id,productId,size}=req.query
        
        const result=await Product.find({_id:productId,"varient.size":size},{_id:0,"varient.$":1})
        const stock=result[0]?.varient?.[0]?.stock
        
        if(stock < 1){
            return res.status(200).json({success:false,message:"Out of stock"})
        }
        await Cart.findByIdAndUpdate(id,{$inc:{quantity:1}})
        await Product.updateOne({_id:productId,"varient.size":size},{$inc:{"varient.$.stock":-1}})
        return res.status(200).json({success:true})

    } catch (error) {
        console.log("error in cart plus one qty "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const removeCart=async(req,res)=>{
    try {
        
        const {id,size,productId}=req.query 
        const userId=req.session.user_id
        let theProduct=await Product.findById(productId,{varient:1})
       
        if(req.query.qty){
            await Cart.deleteOne({_id:id})
            const sizekey=`varient.${size}.stock`
            
            const data = await Product.findOneAndUpdate(
                { _id: productId,"varient.size":size },
                { $inc: { "varient.$.stock": req.query.qty } },
                { new: true } 
            );
            
        }else{
            await Cart.findByIdAndUpdate(id,{$inc:{quantity:-1}})
            await Product.updateOne({_id:productId,"varient.size":size},{$inc:{"varient.$.stock":1}})
            return res.status(200).json({success:true})
        }
       

        res.redirect('/productDetails/cart')

    } catch (error) {
        console.log("error in remove cart "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const cart=async(req,res)=>{
    try {

        
        const userId = req.session.user_id;
        let userName = await isUser.isUser(req);
        const allCart = await Cart.find({ userId: userId })
        const cartData =await Cart.find({ userId: userId }).populate('productId')

        

        
       

        res.render('addtoCart', { cartData, userName });

            
        } catch (error) {
            console.log("error in cart "+error.message)
            return res.status(400).json({success:false,message:"an error occured"})
        }
    }

const allProduct=async (req,res)=>{

    try {

        
        
        const page=parseInt(req.query.page )|| 1
        
        const {sort}= req.query
        const search=(req.query.search || '').trim();
        const regex=new RegExp(`^${search}`,'i');
        const query = { isActive: true, name: { $regex: regex } };
        
        let categoryFillter=req.query.filter
        console.log(req.query)
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
        const cartProduct=await Cart.find({userId:userId}).populate('productId')

        console.log(cartProduct)

        
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
        const prefix = 'ORD'; 
        const timestamp = Date.now(); 
        const randomChars = Math.random().toString(36).substr(2, 5).toUpperCase(); // Generate 5 random characters
    
        return `${prefix}-${timestamp}-${randomChars}`;
    }




const orderSubmission=async(req,res)=>{
    try {

        
        const {productIds,productQty,productPrice,address,totalAmount,cartIds,productSize}=req.body
        
        const productDetails=[]
        for(let i=0;i<productIds.length;i++){
            productDetails.push({product:productIds[i],quantity:productQty[i],price:productPrice[i],cartId:cartIds[i],size:productSize[i]})
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

const addWishlist=async(req,res)=>{
    try {
        
        const {id,size}=req.body
        const userId=req.session.user_id
        const cartProduct=await Cart.findOne({userId:userId,productId:id,size:size})
        
        const wishlistProduct=await Wishlist.findOne({userId:userId,productId:id,size:size})
       

        if(cartProduct === null && wishlistProduct === null){

            console.log("not  in your cart")

            const newWishlist=new Wishlist({
                userId:userId,
                productId:id,
                size:size
            })
            const wishlistdata=await newWishlist.save()
            
            return res.status(200).json({success:true, message: " Added Wishlist  successfully" });
        }else{
            console.log("allr redy in your cart")
            return res.status(200).json({success:false, message: "Product allready in your cart or wishlist" });
        }
        
        
    } catch (error) {
        console.log("error in add wishlist "+error.message)
        res.status(500).json({ message: "Error adding to wishlist" });
    }
}
const renderWishlist=async(req,res)=>{
    try {
        const userId=req.session.user_id
        let userName=await isUser.isUser(req)
        wishlistItems = await Wishlist.find({userId:userId}).populate('productId')
        console.log(wishlistItems)
        res.render("wishlist",{wishlistItems,userName})
    } catch (error) {
        console.log("error in render the wishlist "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const removeWishlist=async(req,res)=>{
    try {
        console.log("inside fetch remove whishlist")
        console.log(req.body)
        const id=req.body.Id
        if(!id){
            return res.status(400).json({success:false,message:"Wishlist ID is required"})
        }
        const result=await wishlist.findByIdAndDelete(id)
        if(!result){
            return res.status(400).json({success:false,message:"Wishlist item not found"})
        }
        return res.status(200).json({success:true,message:"wishlist removed"})
    } catch (error) {
        console.log("allr redy in your cart")
        return res.status(500).json({success:false });
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
    orderSuccess,
    stockDetails,
    updateCartQty,
    addWishlist,
    renderWishlist,
    removeWishlist
}



