const {processImage}=require("../../helpers/imageHelper")
const Product=require('../../models/productSchema')
const path=require('path')
const User=require('../../models/userSchema')





const productManagment=async (req,res)=>{

    console.log("controller")
    try{
        return res.render("productManagment")
    }catch(err){
        console.log("product managment "+err.message)
    }
}



const addProduct=async(req,res)=>{

    try {

        console.log(req.body)
        const {productName,productDiscription,productPrice,productCategory,productSize,productColor,productStock}=req.body
        if (req.files.length > 3) {
            return res.status(400).send('Only up to 3 images are allowed.');
        }

        const processedImages = await Promise.all(req.files.map(async file => {
            const inputPath = path.join(__dirname, '../../public/uploads', file.filename);
            const outputPath = path.join(__dirname, '../../public/uploads', 'processed-' + file.filename);

            await processImage(inputPath, outputPath);

            return {
                path: outputPath,
                filename: file.filename
            };
        }));

        const newProduct= new Product({
            name:productName,
            discription:productDiscription,
            price:productPrice,
            productImage:processedImages,
            varient:[
                {
                    size:productSize,
                    color:productColor,
                    stock:productStock,

                }
            ]

        })

        const productData=await newProduct.save()
        console.log("product saved")
        return res.send("product saved")
        
    } catch (error) {
        
        console.log("error add product "+error.message)
    }
}

//user management 
const userManagement=async(req,res)=>{
    try {


        const data=await User.find({},{_id:1,username:1,email:1,isActive:1})
        
        
        
        res.render("userManagement",{data})
    } catch (error) {
        console.log("error in user management "+error.message)
    }
}

//user management block
const userBlock=async(req,res)=>{

    try{
        const {id}=req.query
        
        await User.updateOne({_id:id},{$set:{isActive:false}})
        console.log("after block the user")

        res.redirect("/admin/userManagement")
    }catch(err){
        console.log("error in user block "+err.message)
    }
    
}

//user unblock
const userUnblock=async(req,res)=>{

    try{
        const {id}=req.query
        await User.updateOne({_id:id},{$set:{isActive:true}})
        console.log("after unblock the user ")
        res.redirect("/admin/userManagement")
    }catch(err){
        console.log("error in user unblock "+err.message)
    }
    
}


module.exports={
    productManagment,
    addProduct,
    userManagement,
    userBlock,
    userUnblock
}