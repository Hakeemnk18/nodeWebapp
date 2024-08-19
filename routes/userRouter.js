const express=require('express')
const router=express.Router()
const userController=require("../controllerss/user/userController")

router.get('/pagenotfound',userController.pageNotfound)
router.get('/',userController.loadHomepage)

module.exports = router