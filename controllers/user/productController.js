const Product=require('../../models/productSchema')
const Category=require('../../models/category')
const product = require('../../models/productSchema')

const productDetails=async (req,res)=>{
    try {
        
        const {id}=req.query
        
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
        

        

        console.log(color)
        console.log(size)
        
    
        res.render('productDetails',{productData,relatedProduct})
    } catch (error) {
       console.log("error in product details page "+error.message) 
    }
}

const addCart=async(req,res)=>{
    try {
        
        res.render('addtoCart')
    } catch (error) {
        console.log("error in addCart "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

module.exports={
    productDetails,
    addCart
}

/////////////////////////////////////////////////////////////////////////////////////////
// const Product=require('../../models/productSchema')
// const Category=require('../../models/category')

// const productDetails=async (req,res)=>{
//     try {
        
//         const {id}=req.query
        
//         const productData=await Product.findOne({_id:id})
//         const relatedProduct=await Product.find({category:productData.category})
//         const color=await Product.aggregate([
//             {$match:{name:productData.name}},
//             {$unwind:"$varient"},
//             {$group:{_id:"$varient.color"}}
            
//         ])
        

        

//         console.log(color)
        
    
//         res.render('productDetails',{productData,relatedProduct})
//     } catch (error) {
//        console.log("error in product details page "+error.message) 
//     }
// }

/////////////////////////////////////////////////////////////////////////////////////////