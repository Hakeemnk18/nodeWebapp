const Product=require('../../models/productSchema')
const Category=require('../../models/category')
const Cart=require('../../models/cartSchema')
const app = require('../../app')

const productDetails=async (req,res)=>{
    try {
        
        const {id}=req.query
        
        let logout;
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
        

        console.log(color)
        console.log(size)
        
    
        res.render('productDetails',{productData,relatedProduct,logout,color,logout,size})
    } catch (error) {
       console.log("error in product details page "+error.message) 
       return res.status(400).json({success:false,message:"an error occured"})
    }
}

const addCart=async(req,res)=>{
    try {
        
        let logout;
        console.log(req.query)
        const {id}=req.query
        const userId=req.session.user_id
        if(req.session.user_id){
            logout="logout"
        }

        const newCart=new Cart({
            userId:userId,
            productId:id
        }) 
        const cartData=await newCart.save()
        const allCart=await Cart.find()

        const productCount=allCart.reduce((acc,cart)=>{
            acc[cart.productId]=(acc[cart.productId]||0)+1
            return acc
        },{})

        const productIds = Object.keys(productCount);
        let cartProduct = await Product.find({ _id: { $in: productIds } });

        cartProduct=cartProduct.map(product =>

            ({...product._doc,count:productCount[product._id]})

        )
        
        

        res.render('addtoCart',{cartProduct})

        

    } catch (error) {
        console.log("error in addCart "+error.message)
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



        

        const limit=12
        const startIndex=(page-1)*limit
        const endIndex=page*limit

       

        const productCount=await Product.find({isActive:true,name:{$regex : regex}}).countDocuments()

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
        
        const allProduct=await Product.find({isActive:true,name:{$regex : regex}})
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
            search
        })
        
    } catch (error) {
        console.log("error in allproduct "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

module.exports={
    productDetails,
    addCart,
    allProduct
}



