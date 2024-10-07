const express=require('express')
const router=express.Router()
const path=require('path')
const adminController=require("../controllers/admin/adminController")
const upload=require('../config/multerHelpper')
const auth=require('../middlewares/adminAuth')
const costumerController=require('../controllers/admin/customerController')
const categoryController=require('../controllers/admin/categoryController')
const ordersController=require('../controllers/admin/ordersController')







//dashboard
router.get('/',auth.isLogin,adminController.dashBoard)

//add product
router.get('/product',auth.isLogin,adminController.allProduct)
router.get('/product/search',auth.isLogin,adminController.searchProduct)
router.get("/product/addProduct",auth.isLogin,adminController.productManagment)
router.post("/product/addProduct",upload.array("productImage"),adminController.addProduct)
router.get('/product/deleteProduct',auth.isLogin,adminController.deleteProduct)
router.get('/product/unblockProduct',adminController.unBlockProduct)
router.get('/product/editProduct/:id',auth.isLogin,adminController.loadEditProduct)
router.post('/product/editProduct/:id',adminController.editProduct)

//usermanagement
router.get('/userManagement',auth.isLogin,costumerController.customerInfo)
router.get('/userManagement/block',auth.isLogin,costumerController.userBlock)
router.get("/userManagement/unblock",auth.isLogin,costumerController.userUnblock)

//category
router.get('/category',auth.isLogin,categoryController.allCategories)
router.get('/category/addCategory',auth.isLogin,categoryController.loadCategory)
router.post('/category/addCategory',categoryController.addCategory)
router.get('/category/deleteCategory',auth.isLogin,categoryController.deleteCategory)
router.get('/category/unblockCategory',auth.isLogin,categoryController.unblockCategory)
router.get('/category/editCategory/:id',auth.isLogin,categoryController.editCategoryLoad)
router.post('/category/editCategory/:id',auth.isLogin, categoryController.editCategory)

//orders
router.get('/orders',ordersController.orders)
router.get('/orders/orderDetails',ordersController.orderDetails)


module.exports=router;


