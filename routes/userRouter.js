const express=require('express')
const router=express.Router()
const userController=require("../controllers/user/userController")

router.get('/pagenotfound',userController.pageNotfound)
router.get('/',userController.loadHomepage)
router.get('/login',userController.loadLogin)
router.get('/signup',userController.loadSignup)
router.post('/signup',userController.signup)
router.post('/login',userController.login)

module.exports = router