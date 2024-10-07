const Category=require('../../models/category')

const allCategories=async(req,res)=>{

    try {

        const search=(req.query.search || "").trim();
        const regex = new RegExp(`^${search}`, 'i');
        const page= parseInt(req.query.page) || 1
        const limit=3


        const startIndex=(page - 1)* limit;
        const endIndex=page * limit
        
        const totalCategory= await Category.find({categoryName:{ $regex: regex }}).countDocuments()



        const data=await Category.find({categoryName:{ $regex: regex }})
        .limit(limit)
        .skip(startIndex)
        .exec()

        const totalPages=Math.ceil(totalCategory/limit)

        

        const message=req.session.message;
        req.session.message=null
        res.render('allCategories',{
            data,
            message,
            currentPage:page,
            hasNextPage:endIndex < totalCategory,
            hasPrevPage:startIndex > 0,
            totalPages,
            search
        })
        
    } catch (error) {
        console.log("error in all categories "+error.message)   
    }
}

const deleteCategory=async(req,res)=>{

    try {

        
        const{id}=req.query
        const {page}=req.query
        
        await Category.updateOne({_id:id},{$set:{isActive:false}})
        
        res.redirect(`/admin/category?page=${page}`)
    } catch (error) {
        console.log("error in block category "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
// unblockCategory
const unblockCategory=async(req,res)=>{
    try {
        const{id}=req.query
        const {page}=req.query
        await Category.updateOne({_id:id},{$set:{isActive:true}})
        res.redirect(`/admin/category?page=${page}`)
    } catch (error) {
        console.log('error in unblock category '+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const editCategoryLoad=async (req,res)=>{
    try {

        const {id}=req.params

        const category = await Category.findOne({ _id: id });
        const { categoryName, description } = category;

        
        res.render('editCategory',{categoryName,description,id})
    } catch (error) {
        console.log("error in edit load page "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

//edit category 
const editCategory=async (req,res)=>{
    try {
        
        const {id}=req.params
        const{categoryName,description}=req.body
        const data=await Category.findOne({categoryName:{ $regex: new RegExp(`^${categoryName}$`, "i") }})
        if(! data){
            await Category.updateOne({_id:id},{$set:{categoryName:categoryName,description:description}})
            res.redirect('/admin/category')
        }else{
            req.session.message="This category name exists"
            res.redirect('/admin/category')
        }
        
    } catch (error) {
        console.log("error in edit category "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}



const loadCategory=async(req,res)=>{

    try {
    
        res.render("addCategory")
    } catch (error) {
        console.log("error in category load "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }

}


const addCategory=async(req,res)=>{

    try {

        
        const{categoryName,categoryDiscription}=req.body
        const categoryData=await Category.findOne({categoryName:{ $regex: new RegExp(`^${categoryName}$`, "i") }})
        if(!categoryData){
            const newCategory=new Category({
                categoryName:categoryName,
                description:categoryDiscription
            })

            await newCategory.save();
            console.log("category saved")
            res.redirect('/admin/category')
        }else{
            console.log("inside else case")
            console.log(categoryData)
            return res.render("addCategory", { errorMessage: 'Category already exists!' });

        }
        

        
        
        
    } catch (error) {
        
        console.log('error in add category '+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}



module.exports={
    allCategories,
    deleteCategory,
    unblockCategory,
    editCategory,
    editCategoryLoad,
    addCategory,
    loadCategory
}