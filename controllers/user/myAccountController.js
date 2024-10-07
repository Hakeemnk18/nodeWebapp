const User=require('../../models/userSchema')
const Address=require('../../models/addressSchema');
const Order = require('../../models/ordersSchema');


const myAccount=async (req,res)=>{
    try {
        
        let logout;
        if(req.session.user_id){
            logout="logout"
        }
        const userData=await User.findOne({_id:req.session.user_id})
        const {message}=req.query

        
        res.render("userProfile",{logout,userData,message})

        
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
        
        let logout;
        if(req.session.user_id){
            logout="logout"
        }
        
        res.render('address',{addressData:user.address,logout})

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
        
        let logout;
        if(req.session.user_id){
            logout="logout"
        }
        res.render('addAddress',{logout,from})
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
        let logout;
        if(req.session.user_id){
            logout="logout"
        }
        const userId=req.session.user_id
        const orderItems=await Order.find({user:userId}).populate('cartItems.product').exec()
        

        res.render('orders',{logout,orderItems})
    } catch (error) {
        console.log("error in orders  : "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const editAccount=async(req,res)=>{
    try {
        let logout;
        let userId
        if(req.session.user_id){
            logout="logout"
            userId=req.session.user_id
        }
        const userData=await User.find({_id:userId})
        console.log(userData)

        res.render('editAccount',{logout,userData})
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
    updateAccount
}