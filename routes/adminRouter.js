const express=require('express')
const router=express.Router()
const path=require('path')
const adminController=require("../controllers/admin/adminController")
const upload=require('../config/multerHelpper')
const auth=require('../middlewares/adminAuth')







//dashboard
router.get('/',auth.isLogin,adminController.dashBoard)

//add product
router.get('/product',auth.isLogin,adminController.allProduct)
router.get('/product/search',auth.isLogin,adminController.searchProduct)
router.get("/product/addProduct",auth.isLogin,adminController.productManagment)
router.post("/product/addProduct",upload.array("productImage",3),adminController.addProduct)
router.get('/product/deleteProduct/:id',auth.isLogin,adminController.deleteProduct)
router.get('/product/editProduct/:id',auth.isLogin,adminController.loadEditProduct)
router.post('/product/editProduct/:id',adminController.editProduct)

//usermanagement
router.get('/userManagement',auth.isLogin,adminController.userManagement)
router.get('/userManagement/block',auth.isLogin,adminController.userBlock)
router.get("/userManagement/unblock",auth.isLogin,adminController.userUnblock)

//category
router.get('/category',auth.isLogin,adminController.allCategories)
router.get('/category/addCategory',auth.isLogin,adminController.loadCategory)
router.post('/category/addCategory',adminController.addCategory)
router.get('/category/deleteCategory/:id',auth.isLogin,adminController.deleteCategory)
router.get('/category/editCategory/:id',auth.isLogin,adminController.editCategoryLoad)
router.post('/category/editCategory/:id',auth.isLogin,adminController.editCategory)



module.exports=router;


