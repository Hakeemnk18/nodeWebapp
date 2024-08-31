const express=require('express')
const router=express.Router()
const path=require('path')
const adminController=require("../controllers/admin/adminController")
const upload=require('../config/multerHelpper')








router.get("/productManagment",adminController.productManagment)
router.post("/productManagment",upload.array("productImage",3),adminController.addProduct)

module.exports=router;


