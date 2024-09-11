const {processImage}=require("../../helpers/imageHelper")
const Product=require('../../models/productSchema')
const path=require('path')
const User=require('../../models/userSchema')
const Category=require('../../models/category')



//admin dashboard
const dashBoard=async(req,res)=>{
    try {
        res.render('adminDashboard')
    } catch (error) {
        console.log("error in dashboard "+error.message)
    }
}

//all product
const allProduct=async (req,res)=>{
    try {
        
        const data=await Product.find({})
        res.render('allProduct',{data})
    } catch (error) {
        console.log("error in all product list "+error.message)
    }
}

//search product
const searchProduct=async(req,res)=>{
    try {
        
        const query = req.query.search || ''; 
        const regex = new RegExp(`^${query}`, 'i');
        const data= await Product.find({name: { $regex: regex } })
        console.log(data)
        
        
        res.render('allProduct',{data})
    } catch (error) {
        console.log("error in search product "+error.message)
    }
}


// add product get method

const productManagment=async (req,res)=>{

    
    try{
        const category=await Category.find({})
        return res.render("productManagment",{category})
    }catch(err){
        console.log("product managment "+err.message)
    }
}


// add product post


const addProduct=async(req,res)=>{

    try {

        
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

        console.log(processedImages)

        const newProduct= new Product({
            name:productName,
            description:productDiscription,
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
        return res.redirect('/admin/product')
        
    } catch (error) {
        
        console.log("error add product "+error.message)
    }
}

// delete product
const deleteProduct=async(req,res)=>{

    try {
        
        const{id}=req.params
        
        await Product.deleteOne({_id:id})
        res.redirect('/admin/product')
    } catch (error) {
        console.log("error in delete group "+error.message)
    }
}


// load edit product

const loadEditProduct=async(req,res)=>{
    
    try {
        
        
        const {id}=req.params
        const data=await Product.findOne({_id:id})
        const {name,description,price,varient}=data
        const {size,stock,color}=varient[0]
        //console.log(name,discription,price,size,stock,color)
        res.render('editProduct',{name,description,price,size,stock,color,id})


    } catch (error) {
        console.log("error in load edit product "+error.message)
    }
}

//edit product
const editProduct=async(req,res)=>{
    try {
        const {id}=req.params
        const {productName,productDiscription,productPrice,productCategory,productSize,productColor,productStock}=req.body
        console.log(req.body)

        await Product.updateOne(
            {_id:id},
            {
                name:productName,
                description:productDiscription,
                price:productPrice,
                varient:[
                    {
                        size:productSize,
                        color:productColor,
                        stock:productStock,

                    }
                ]

            }
        )
        res.redirect('/admin/product')
    } catch (error) {
        console.log("error in edit product "+error.message)
    }
}



















module.exports={
    productManagment,
    addProduct,
    dashBoard,
    allProduct,
    deleteProduct,
    loadEditProduct,
    editProduct,
    searchProduct,
    
}