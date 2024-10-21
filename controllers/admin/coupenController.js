const Coupon=require("../../models/couponSchema")

const coupon=async(req,res)=>{
    try {
        const allCoupon=await Coupon.find({})
        
        res.render("couponManagemnt",{allCoupon})
    } catch (error) {
        console.log("error in admin coupen "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const addCoupon=async(req,res)=>{
    try {
        
        res.render("addCoupon")
    } catch (error) {
        console.log("error in admin add coupen "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const addNewCoupon=async(req,res)=>{
    try {
        console.log(req.body)
        const {couponCode,discoundValue,minValue,expiryDate}=req.body
        const newCoupon=new Coupon({
            code:couponCode,
            discoundValue:discoundValue,
            minCartValue:minValue,
            expiresAt:expiryDate
        })
        const data=await newCoupon.save()
        
        res.redirect("/admin/coupon")
        
    } catch (error) {
        console.log("error in admin add coupen "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const checkUnique=async(req,res)=>{
    try {
        console.log("inside code unique fetch")
        console.log(req.body)
        const {code}=req.body
        
        const data=await Coupon.findOne({code:{ $regex: new RegExp(`^${code}$`, "i") }})
        if(data){
            console.log("cuopon allready exist")
            return res.status(200).json({isValid:false})
        }else{
            console.log("cuopon is unique")
            return res.status(200).json({isValid:true})
        }
        
    } catch (error) {
        console.log("error in cuopon code unique check "+error.message)
        res.status(500).json({ message: "Internal Server Error" });
    }
}
const checkEditUnique=async(req,res)=>{
    try {
        const {code,id}=req.body
        const currentData=await Coupon.findById(id)
        if(currentData.code === code){
            console.log("same code ")
            return res.status(200).json({isValid:true})
        }else{
            const data=await Coupon.findOne({code:{ $regex: new RegExp(`^${code}$`, "i") }})
            if(data){
                console.log("cuopon allready exist")
                return res.status(200).json({isValid:false})
            }else{
                console.log("cuopon is unique")
                return res.status(200).json({isValid:true})
            }
        }
        
        return res.status(200).json({isValid:false})
    } catch (error) {
        console.log("error in cuopon code unique check for edit coupon"+error.message)
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const blockCoupon=async(req,res)=>{
    try {
        
        const {id}=req.query
        await Coupon.findByIdAndUpdate(id,{$set:{isActive:false}})
        res.redirect("/admin/coupon")
    } catch (error) {
        console.log("error in admin coupen block "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const unblockCoupon=async(req,res)=>{
    try {
        const {id}=req.query
        await Coupon.findByIdAndUpdate(id,{$set:{isActive:true}})
        res.redirect("/admin/coupon")
    } catch (error) {
        console.log("error in admin coupen un block "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const editCoupon=async(req,res)=>{
    try {
        console.log(req.query)
        const {id}=req.query
        const data=await Coupon.findById(id)
        console.log(data)
        console.log(new Date(data.expiresAt).toISOString().slice(0, 10))
        res.render("editCoupon",{data})
    } catch (error) {
        console.log("error in admin coupon edit "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const editCouponUpdate=async(req,res)=>{
    try {
        console.log(req.body)
        const {couponCode,discoundValue,minValue,expiryDate,id}=req.body
        const updated=await Coupon.findByIdAndUpdate(id,
            {
                code:couponCode,
                discoundValue:discoundValue,
                minCartValue:minValue,
                expiresAt:expiryDate
            }
        ) 
        console.log(updated)
        res.redirect("/admin/coupon")
    } catch (error) {
        console.log("error in admin coupon edit updated "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

module.exports={
    coupon,
    addCoupon,
    addNewCoupon,
    checkUnique,
    blockCoupon,
    unblockCoupon,
    editCoupon,
    editCouponUpdate,
    checkEditUnique
}