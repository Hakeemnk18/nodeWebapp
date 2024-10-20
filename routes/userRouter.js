const express=require('express')
const router=express.Router()
const userController=require("../controllers/user/userController")
const passport = require('passport')
const adminAuth=require('../middlewares/adminAuth')
const userAuth=require('../middlewares/userAuth')
const productController=require('../controllers/user/productController')
const profileController=require('../controllers/user/myAccountController')

router.get('/pagenotfound',userController.pageNotfound)
router.get('/',userController.loadHomepage)
router.get('/login',adminAuth.isLogout,userAuth.isLogout,userController.loadLogin)
router.get('/signup',adminAuth.isLogout,userAuth.isLogout,userController.loadSignup)
router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/verify-otp',userController.otpverification)
router.get('/resend-otp',userController.resendOtp)
router.get('/forgotPassword',userController.forgotPassword)
router.post('/forgotPassword',userController.forgotEmailVarification)

//logout
router.get('/logout',userController.logout)

//product details
router.get('/products',userAuth.isLogin,productController.allProduct)
router.get('/productDetails',userAuth.isLogin,productController.productDetails)
router.get('/productDetails/addCart',userAuth.isLogin,productController.addCart)
router.get('/productDetails/cart',userAuth.isLogin,productController.cart)
router.post('/productDetails/wishlist',userAuth.isLogin,productController.addWishlist)
router.get('/productDetails/wishlist',userAuth.isLogin,productController.renderWishlist)
router.get("/productDetails/addCart/sub",userAuth.isLogin,productController.removeCart)
router.get("/productDetails/addCart/addQty",productController.updateCartQty)
router.get("/productDetails/cart/checkout",userAuth.isLogin,productController.checkout)
router.post('/productDetails/cart/checkout',userAuth.isLogin,productController.orderSubmission)
router.get('/productDetails/cart/checkout/success',userAuth.isLogin,productController.orderSuccess)
router.get('/api/product/stock',userAuth.isLogin,productController.stockDetails)
router.post('/wishlist/remove',userAuth.isLogin,productController.removeWishlist)

//my account
router.get("/myAccount",userAuth.isLogin,profileController.myAccount)
router.get('/myAccount/address',userAuth.isLogin,profileController.addressManegment)
router.get('/myAccount/address/addAddress',userAuth.isLogin,profileController.loadAddadress)
router.post('/myAccount/address/addAddress',profileController.addAddress)
router.get("/myAccount/address/setDefault",userAuth.isLogin,profileController.setDefault)
router.get("/myAccount/address/deleteAddress",userAuth.isLogin,profileController.deleteAddress)
router.get("/myAccount/address/updateAddress",userAuth.isLogin,profileController.updateAddress)
router.get('/myAccount/orders',userAuth.isLogin,profileController.orders)
router.get('/myAccount/editAccount',userAuth.isLogin,profileController.editAccount)
router.post('/myAccount/editAccount',userAuth.isLogin,profileController.updateAccount)
router.get("/myAccount/resetPassword",userAuth.isLogin,profileController.resetPassword)
router.post('/myAccount/resetPassword/checkPassword',userAuth.isLogin,profileController.checkOldPassword)
router.post('/myAccount/resetPassword',userAuth.isLogin,profileController.addNewPassword)
router.get('/myAccount/orders/trackOrder',userAuth.isLogin,profileController.trackOrder)
router.get('/myAccount/orders/cancelOrder',userAuth.isLogin,profileController.orderCancel)
router.get('/myAccount/orders/returnOrder',userAuth.isLogin,profileController.returnOrder)



router.get("/auth/google",passport.authenticate('google',{scope:['profile','email']}));
router.get("/google/callback",passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
});


module.exports = router