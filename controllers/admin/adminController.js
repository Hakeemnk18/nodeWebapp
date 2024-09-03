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




// add product get method

const productManagment=async (req,res)=>{

    console.log("controller")
    try{
        return res.render("productManagment")
    }catch(err){
        console.log("product managment "+err.message)
    }
}


// add product post


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

//load category
const loadCategory=async(req,res)=>{

    try {
    
        res.render("addCategory")
    } catch (error) {
        console.log("error in category load "+error.message)
    }

}


const addCategory=async(req,res)=>{

    try {

        
        const{categoryName,categoryDiscription}=req.body
        const newCategory=new Category({
            categoryName:categoryName,
            description:categoryDiscription
        })

        await newCategory.save();
        console.log("category saved")
        res.send('category saved')
        
    } catch (error) {
        
        console.log('error in add category '+error.message)
    }
}

//all categories

const allCategories=async(req,res)=>{

    try {

        const data=await Category.find()
        res.render('allCategories',{data})
        
    } catch (error) {
        console.log("error in all categories "+error.message)   
    }
}

//delete category

const deleteCategory=async(req,res)=>{

    try {

        
        const{id}=req.params
        
        await Category.deleteOne({_id:id})
        
        res.redirect('/admin/category')
    } catch (error) {
        console.log("error in delete product "+error.message)
    }
}

//edit category load page
const editCategoryLoad=async (req,res)=>{
    try {

        const {id}=req.params

        const category = await Category.findOne({ _id: id });
        const { categoryName, description } = category;

        
        res.render('editCategory',{categoryName,description,id})
    } catch (error) {
        console.log("error in edit load page "+error.message)
    }
}

//edit category 
const editCategory=async (req,res)=>{
    try {
        
        const {id}=req.params
        const{categoryName,description}=req.body
        await Category.updateOne({_id:id},{$set:{categoryName:categoryName,description:description}})
        res.redirect('/admin/category')
    } catch (error) {
        console.log("error in edit category "+error.message)
    }
}




module.exports={
    productManagment,
    addProduct,
    userManagement,
    userBlock,
    userUnblock,
    dashBoard,
    loadCategory,
    addCategory,
    allCategories,
    deleteCategory,
    editCategoryLoad,
    editCategory
}