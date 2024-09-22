const {processImage}=require("../../helpers/imageHelper")
const Product=require('../../models/productSchema')
const path=require('path')
const User=require('../../models/userSchema')
const Category=require('../../models/category')
const fs=require('fs')




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
        const search=req.query.search || ''; 
        const regex = new RegExp(`^${search}`, 'i');
        const page = parseInt(req.query.page)|| 1
        const limit=2
        const startIndex=(page-1)*limit
        const endIndex=page*limit

        const totalProducts=await Product.find({name: { $regex: regex } }).countDocuments()
        const totalPages=Math.ceil(totalProducts/limit)

        const data= await Product.find({name: { $regex: regex } })
        .limit(limit)
        .skip(startIndex)
        .exec()

        
        const currentPage=page
        

        res.render('allProduct',{
            data,
            totalPages,
            hasPrevPage:startIndex>0,
            hasNextPage:endIndex<totalProducts,
            currentPage

        })
    } catch (error) {
        return res.status(400).json({success:false,message:"an error occured"})
        console.log("error in all product list "+error.message)
    }
}

//search product
const searchProduct=async(req,res)=>{
    try {
        
        const query = req.query.search || ''; 
        const regex = new RegExp(`^${query}`, 'i');
        const data= await Product.find({name: { $regex: regex } })
        
        
        
        res.render('allProduct',{data})
    } catch (error) {
        return res.status(400).json({success:false,message:"an error occured"})
        console.log("error in search product "+error.message)
    }
}


// add product get method

const productManagment=async (req,res)=>{

    
    try{
        const category=await Category.find({isActive:true})
        
        return res.render("productManagment",{category})
    }catch(err){
        return res.status(400).json({success:false,message:"an error occured"})
        console.log("product managment "+err.message)
    }
}

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}



// add product post
const addProduct=async(req,res)=>{

    try {

        console.log('inside add product')
        
        const croppedImages = [
            req.body.croppedImage1,
            req.body.croppedImage2,
            req.body.croppedImage3
        ];

        const savedImagePaths = [];
        croppedImages.forEach((base64Image, index) => {
            if (base64Image) {
                // Extract the base64 data (removing the 'data:image/jpeg;base64,' part)
                const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, "");
                
                // Generate a unique file name
                const fileName = `cropped_image_${Date.now()}_${index}.jpg`;
                const filePath = path.join(uploadsDir, fileName);

                // Save the file to disk
                fs.writeFileSync(filePath, base64Data, 'base64');
                savedImagePaths.push(fileName); // Store the file paths to use later
            }
        });


        console.log(savedImagePaths) 

        const {productName,productDiscription,productPrice,productCategory,productSize,productColor,productStock}=req.body
        if (req.files.length > 3) {
            console.log("not allowed more than 3 image")
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

        console.log()

        const newProduct= new Product({
            name:productName,
            description:productDiscription,
            price:productPrice,
            productImage:processedImages,
            croppedImage:savedImagePaths,
            varient:[
                {
                    size:productSize,
                    color:productColor,
                    stock:productStock,

                }
            ],
            category:productCategory

        })

        const productData=await newProduct.save()
        console.log("product saved")
        return res.redirect('/admin/product')
        
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: "Error in add  product ",
            error: error.message
        });
        console.log("error add product "+error.message)
    }
}

// delete product
const deleteProduct=async(req,res)=>{

    try {
        
        const{id,page}=req.query
        
        await Product.updateOne({_id:id},{$set:{isActive:false}})
        
        res.redirect(`/admin/product?page=${page}`)
    } catch (error) {
        console.log("error in delete product "+error.message)
        res.status(500).json({
            success: false,
            message: "Error in blocking customer",
            error: error.message
          });
    }
}

const unBlockProduct=async (req,res)=>{
    try {
        const{id,page}=req.query
        
        await Product.updateOne({_id:id},{$set:{isActive:true}})
        res.redirect(`/admin/product?page=${page}`)
        
    } catch (error) {
        console.log("error in unblock product "+error.message)
        
        res.status(500).json({
            success: false,
            message: "Error in unblocking customer",
            error: error.message
          });
    }
}


// load edit product

const loadEditProduct=async(req,res)=>{
    
    try {
        

        const {id}=req.params
        const data=await Product.findOne({_id:id})
        const {name,description,price,varient,category,croppedImage}=data
        const {size,stock,color}=varient[0]
        const find=await Category.findOne({_id:category},{categoryName:1})
        
        const allCategory=await Category.find({categoryName:{$ne:find.categoryName}})

        console.log(croppedImage)
        
        res.render('editProduct',{name,description,price,size,stock,color,id,allCategory,find,croppedImage})

        


    } catch (error) {
        console.log("error in load edit product "+error.message)
        res.status(500).json({
            success: false,
            message: "Error in edit product customer",
            error: error.message
          });
    }
}

//edit product
const editProduct=async(req,res)=>{
    try {
        const {id}=req.params
        const {productName,productDiscription,productPrice,productCategory,productSize,productColor,productStock}=req.body
        

        const data=await Product.updateOne(
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
                ],
                category:productCategory

            }
        )
        
        res.redirect('/admin/product')
    } catch (error) {
        console.log("error in edit product "+error.message)
        res.status(500).json({
            success: false,
            message: "Error in add edit product customer",
            error: error.message
          });
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
    unBlockProduct,
    
}