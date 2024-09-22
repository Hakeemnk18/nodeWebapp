const express=require('express')
const router=express.Router()
const userController=require("../controllers/user/userController")
const passport = require('passport')
const adminAuth=require('../middlewares/adminAuth')
const userAuth=require('../middlewares/userAuth')
const productController=require('../controllers/user/productController')

router.get('/pagenotfound',userController.pageNotfound)
router.get('/',userController.loadHomepage)
router.get('/login',adminAuth.isLogout,userAuth.isLogout,userController.loadLogin)
router.get('/signup',adminAuth.isLogout,userAuth.isLogout,userController.loadSignup)
router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/verify-otp',userController.otpverification)
router.get('/resend-otp',userController.resendOtp)

//logout
router.get('/logout',userController.logout)

//product details
router.get('/products',productController.allProduct)
router.get('/productDetails',userAuth.isLogin,productController.productDetails)
router.get('/productDetails/addCart',userAuth.isLogin,productController.addCart)

router.get("/auth/google",passport.authenticate('google',{scope:['profile','email']}));
router.get("/google/callback",passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
});


module.exports = router