const User=require('../../models/userSchema')
const Address=require('../../models/addressSchema');
const Order = require('../../models/ordersSchema');
const bcrypt = require('bcrypt');
const moment=require('moment')
const isUser=require('../../helpers/isUserlogin')


const myAccount=async (req,res)=>{
    try {
        
        let userName=await isUser.isUser(req)
        const userData=await User.findOne({_id:req.session.user_id})
        const {message}=req.query

        
        res.render("userProfile",{userName,userData,message})

        
    } catch (error) {
        console.log("error in my account "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const addressManegment=async (req,res)=>{
    try {

        const addressData= await Address.find({isActive:true})
        const userId=req.session.user_id
        const user=await User.findById(userId).populate({path:'address',match:{isActive:true}}).exec()
        
        let userName=await isUser.isUser(req)
        
        res.render('address',{addressData:user.address,userName})

    } catch (error) {
        
        console.log("error in addrest management "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const loadAddadress=async (req,res)=>{

    try {

        let from;
        if(req.query.from){
            from=req.query.from
            
        }
        
        let userName=await isUser.isUser(req)

        res.render('addAddress',{userName,from})
    } catch (error) {
        console.log("error in addrest management "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const addAddress=async (req,res)=>{

    try {
        

        const newAddress=new Address({
            houseNumber:req.body.houseNumber,
            street:req.body.street,
            village:req.body.village,
            city:req.body.city,
            pincode:req.body.pincode,
            country:req.body.country,
        })

        const addressData=await newAddress.save()
        const user_id=req.session.user_id

        await User.updateOne({_id:user_id},{ $push: { address: addressData._id } } )
        
        
        
        if(req.body.from){
            return res.redirect("/productDetails/cart/checkout")
        }
        return res.redirect("/myAccount/address");

    } catch (error) {
        console.log("error in addrest management "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const setDefault=async(req,res)=>{
    try {
        console.log(req.query)
        const {id}=req.query
        await Address.updateMany({_id:{$ne:id}},{$set:{isDefault:false}})
        await Address.updateOne({_id:id},{$set:{isDefault:true}})
        const updateData=await Address.findOne({_id:id})
        console.log(updateData)
        res.redirect("/myAccount/address");

    } catch (error) {
        console.log("error in set defualt adddres  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const deleteAddress=async(req,res)=>{
    try {
        const {id}=req.query
        const addressData=await Address.findOne({_id:id},{isDefault:1})
        await Address.updateOne({_id:id},{isActive:false})
        if(addressData.isDefault === true){
            await Address.updateOne({},{$set:{isDefault:true}})
        }
        res.redirect("/myAccount/address");
    } catch (error) {
        console.log("error in delete adddres  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const updateAddress=async(req,res)=>{
    try {
        
        const {id}=req.query
        await Address.updateOne({_id:id},{
            houseNumber:req.query.houseNumber,
            street:req.query.street,
            village:req.query.village,
            city:req.query.city,
            pincode:req.query.pincode,
            country:req.query.country
        })
        res.redirect("/myAccount/address");

    } catch (error) {
        console.log("error in update address adddres  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const orders=async(req,res)=>{
    try {
        let userName=await isUser.isUser(req)
        
        let dateField=[]
        const userId=req.session.user_id
        const orderItems=await Order.find({user:userId}).populate('cartItems.product').exec()

        for(let i=0;i<orderItems.length;i++){
            dateField.push(moment(orderItems[i].orderDate).format('DD/MM/YYYY'))
        }

        
        
        res.render('orders',{userName,orderItems,dateField})
    } catch (error) {
        console.log("error in orders  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const editAccount=async(req,res)=>{
    try {
        
        
        let userId
        if(req.session.user_id){
            
            userId=req.session.user_id
        }
        let userName=await isUser.isUser(req)
        const userData=await User.find({_id:userId})
       

        res.render('editAccount',{userName,userData})
    } catch (error) {
        console.log("error in edit account  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const updateAccount=async(req,res)=>{
    try {
        
        const {userName,email,phoneNumber,firstname,lastName}=req.body
        let userId
        if(req.session.user_id){
            
            userId=req.session.user_id
        }

        const currentUser=await User.findOne({_id:userId})
        
        let userNameData;
        let emailData;
        let phoneData;

        if(currentUser.username !== userName){
             userNameData = await User.findOne({ username: userName });
        }
        if(currentUser.email !== email){
            emailData = await User.findOne({ email: email });
        }
        if(currentUser.phoneNumber !== phoneNumber){
            phoneData = await User.findOne({ phoneNumber: phoneNumber });
        }
        

        if (userNameData || emailData || phoneData) {
            return res.redirect('/myAccount?message=User already exists');
        }
        

        await User.updateOne({_id:userId},
            {$set:{username:userName,
                email:email,
                phoneNumber:phoneNumber,
                firstName:firstname,
                lastName:lastName
            }})

        return res.redirect('/myAccount');
    } catch (error) {
        console.log("error in update account  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const resetPassword=async(req,res)=>{

    try {

        
        let userName=await isUser.isUser(req)
        
        
        res.render('resetPassword',{userName})
    } catch (error) {
        console.log("error in update account  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const checkOldPassword=async(req,res)=>{

    try {
        
        const {oldPassword}=req.body
        
        let userId
        if(req.session.user_id){
            
            userId=req.session.user_id
        }

        const user=await User.findOne({_id:userId})

       

        const passwordMatch=await bcrypt.compare(oldPassword,user.password)

        if(passwordMatch){
            console.log("isValid")
            return res.json({isValid:true})
            
        }else{
            console.log("is not Valid")
            return res.json({isValid:false})
        }

        
    } catch (error) {
        console.log("error in check old password  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (err) {
        console.log("err in securepasword" + err.message)
    }
}
const addNewPassword=async(req,res)=>{
    try {
        

        const {newPassword}=req.body
        const hashPassword=await securePassword(newPassword)
        let userId
        if(req.session.user_id){
            
            userId=req.session.user_id
        }

        const update=await User.findByIdAndUpdate(userId,{$set:{password:hashPassword}},{new:true})
        
        return res.redirect('/myAccount');
    } catch (error) {
        console.log("error in add new password  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

module.exports={
    myAccount,
    addressManegment,
    loadAddadress,
    addAddress,
    setDefault,
    deleteAddress,
    updateAddress,
    orders,
    editAccount,
    updateAccount,
    resetPassword,
    checkOldPassword,
    addNewPassword
}