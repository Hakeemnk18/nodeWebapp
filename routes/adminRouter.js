const express=require('express')
const router=express.Router()
const path=require('path')
const adminController=require("../controllers/admin/adminController")
const upload=require('../config/multerHelpper')







//dashboard
router.get('/',adminController.dashBoard)

//add product
router.get("/addProduct",adminController.productManagment)
router.post("/addProduct",upload.array("productImage",3),adminController.addProduct)

//usermanagement
router.get('/userManagement',adminController.userManagement)
router.get('/userManagement/block',adminController.userBlock)
router.get("/userManagement/unblock",adminController.userUnblock)

//category
router.get('/category',adminController.allCategories)
router.get('/category/addCategory',adminController.loadCategory)
router.post('/category/addCategory',adminController.addCategory)
router.get('/category/deleteCategory/:id',adminController.deleteCategory)
router.get('/category/editCategory/:id',adminController.editCategoryLoad)
router.post('/category/editCategory/:id',adminController.editCategory)



module.exports=router;


