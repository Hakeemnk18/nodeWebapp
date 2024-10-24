
const Product=require("../../models/productSchema")
const Category=require('../../models/category')
const { findById } = require("../../models/userSchema")
const { query } = require("express")
const Referral=require("../../models/referralSchema")

const addOffer=async(req,res)=>{
    try {
      
        const {type,id}=req.query
        res.render("addOffer",{type,id})
    } catch (error) {
        console.log("error in admin add offer "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}



const addNewOffer=async(req,res)=>{
    try {
        
        const {id,type,offerEnd,offerStart,productOffer,offerValue}=req.body
        console.log(req.body)
        if(type === 'product'){
            console.log("inside product add offer")
            const product=await Product.findByIdAndUpdate(id,{$set:{
                "offer.type":productOffer,
                "offer.value":offerValue,
                "offer.startDate":offerStart,
                "offer.endDate":offerEnd
            }},{new:true})

            
            return res.redirect('/admin/product')

        }else if(type === 'category'){
            console.log("inside category add offer")
            const category=await Category.findByIdAndUpdate(id,{$set:{
                "offer.type":productOffer,
                "offer.value":offerValue,
                "offer.startDate":offerStart,
                "offer.endDate":offerEnd
            }},{new:true})

            
            return res.redirect('/admin/category')
        }

       

    } catch (error) {
        console.log("error in admin add new offer "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const editOffer=async(req,res)=>{
    try {
        
        const {type,id}=req.query
        if(type === 'product'){
            console.log("inside edit product offer")
            const data=await Product.findById(id,{offer:1})
            console.log(data)
            return res.render("editOffer",{type,id,data})
            
        }else if(type === 'category'){
            console.log("inside edit category offer")
            const data=await Category.findById(id,{offer:1})
            console.log(data)
            return res.render("editOffer",{type,id,data})
        }
    } catch (error) {
        console.log("error in admin edit offer "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const referral=async(req,res)=>{
    try {
        const referral=await Referral.findOne()
        // console.log(referral);
        res.render("referral",{referral})
    } catch (error) {
        console.log("error in admin referral "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const updateReferral=async(req,res)=>{
    try {
        console.log("inside referel fetch")
        console.log(req.body)
        const {status,bonus}=req.body
        await Referral.deleteOne()
        const newReferral=new Referral({
            bonus:bonus,
            isActive:status
        })
        const dar=await newReferral.save()
        console.log(dar)
        return res.status(200).json({message:"referral added succesfully"})
    } catch (error) {
        console.log("error referral fetch "+error.message)
        res.status(500)
    }
}

module.exports={
    addOffer,
    addNewOffer,
    editOffer,
    referral,
    updateReferral
}