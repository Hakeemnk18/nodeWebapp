const express=require('express')
const router=express.Router()
const path=require('path')
const adminController=require("../controllers/admin/adminController")



router.get("/productManagment",adminController.productManagment)

module.exports=router;