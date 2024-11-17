const user = require('../../models/userSchema')
const Product=require('../../models/productSchema')
const bcrypt = require('bcrypt');
const { CommandSucceededEvent } = require('mongodb');
const nodemail=require('nodemailer')
const env=require("dotenv").config();
const isUser=require('../../helpers/isUserlogin')
const Wallet=require("../../models/walletSchema")
const crypto=require("crypto");
const { fail } = require('assert');


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (err) {
        console.log("err in securepasword" + err.message)
    }
}

const pageNotfound = async (req, res) => {

    try {
        let userName=await isUser.isUser(req)
        res.render("page-404",userName)
    } catch (error) {
        console.log("err in pagenot found")
        res.redirect("/pageNotfound")
    }
}
function generateReferralCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < length; i++) {
        referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return referralCode;
}


const loadHomepage = async (req, res) => {

    try {
        
        console.log("inside load home page")
        const product=await Product.find({isActive:true}).limit(4).exec()
        console.log(product)
        const latestProduct=await Product.find({})
        .sort({createdAt:-1})
        .limit(8)
        .exec()
        console.log(latestProduct)
        if(req.session.passport){
            
            const gUser=await user.find({_id:req.session.passport.user},{isActive:1})
            const active=gUser[0].isActive
            console.log(active)
            req.session.user_id=req.session.passport.user
            req.session.isActive=active

            
        }
        let userName=await isUser.isUser(req)
        
        
        return res.render("home",{userName,product,latestProduct})
    } catch (error) {
        console.log("err in load Home page "+error.message)
        res.status(500).send("Server error")
    }
}



// render the signup page get 
const loadSignup = async (req, res) => {

    try {
        let userName=await isUser.isUser(req)
        return res.render("signup",{userName})
    } catch (error) {
        console.log("err in load signup page" + error)
        res.status(500).send("Server error")
    }
}



//otp genarotore
function genareteOtp(){
   
    return Math.floor(1000 + Math.random()*9000).toString()
}

//send otp to email
async function sendVerificationEmail(email,otp){

    try {
        
        const transport= nodemail.createTransport({

            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })
        
        const info= await transport.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"verify your account",
            text:`your otp is ${otp}`,
            html:`<b>your OTP : ${otp}</b>`
        })
        
        return info.accepted.length > 0
        
    } catch (error) {
        
        console.log("sending email "+error)
        return false
    }

}

//register new user
const signup = async (req, res) => {
    
    
    try{
        const {username,email,password,phone}=req.body
        const userData=await user.findOne({email:email})
        const phonData=await user.findOne({phoneNumber:phone})
        if(userData){
            return res.render('signup', { message: "User with this email already exists" });
        }
        if(phonData){
            return res.render('signup', { message: "User with this phone number already exists" });
        }
        
        const otp=genareteOtp()
        console.log("after genarationg otp "+otp)
        const emailSend=await sendVerificationEmail(email,otp)
        if(!emailSend){
            return res.json("email.error")
        }
        
        req.session.userOtp=otp;
        req.session.userData={email,password,phone,username};
        

        res.render("verify-otp")


    }catch(error){
        res.status(400).json({
            success: false,
            message: "Error in signup customer",
            error: error.message
          });
        console.log("error when the register new user "+error.message)
    }
}

//verify the user otp

const otpverification=async (req,res)=>{

    try {
        const {otp}=req.body
        
        if(otp===req.session.userOtp){
            console.log(" otp verification succesful : "+otp+" with session otp "+req.session.otp)
            const User=req.session.userData;
            const passwordHash=await securePassword(User.password)
            const referralCode=generateReferralCode()
            
            const newUser=new user({
                username:User.username,
                password:passwordHash,
                email:User.email,
                phoneNumber:User.phone,
                referral:referralCode,
                referralClimed:true
            })

            const userData= await newUser.save()
            req.session.user_id=userData._id
            req.session.role=userData.role

            const newWallet=new Wallet({
                userId:userData._id
            })
            const userWallet=await newWallet.save()

            
            //console.log(userData)
            //console.log(req.session.user_id)

            res.json({
                success:true,
                redirectUrl:'/'
            })
        }else{
            console.log("otp doesn't match")
            return res.status(400).json({success:false,message:"invalid OTP , please try again"})
        }
        
    } catch (error) {
        console.log("otp catch block "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
    
}

//resend otp 
const resendOtp=async (req,res)=>{

    try {
        
        
        const otp=genareteOtp()
        
        const email=req.session.userData.email
        const emailSend=await sendVerificationEmail(email,otp)
        
        if(!emailSend){
            return res.json("email.error")
        }
        req.session.userOtp=otp;

        res.render("verify-otp")
        

    } catch (error) {
        console.log("error in resend otp "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
       
    }
}

//  load login page

const loadLogin = async (req, res) => {

    try {
        let userName=await isUser.isUser(req)
        return res.render("login",{userName})
    } catch (err) {
        console.log("err in load login page " + err)
        res.status(500).send("Server error")
    }
}

// verify the user
const login = async (req, res) => {

    try {
        const { username, password } = req.body

        const userData = await user.findOne({ username: username})
        
        if (userData) {
            const isActive=await user.findOne({username: userData.username,isActive:true})
            if(isActive){
                const passwordMatch = await bcrypt.compare(password, userData.password)
                if (passwordMatch) {
                    if (userData.role === "admin") {
                        req.session.admin_id=userData._id
                        
                        
                        return res.redirect("/admin")
                    }
                    req.session.user_id=userData._id
                    req.session.isActive=userData.isActive
                    
                    return  res.redirect("/")
                }else{
                    console.log("invalid user passsword dont match")
                    return res.render("login",{message:"username or password dosen't match"})
                }
            }else{
                console.log("blocked user")
                return res.render("login",{message:"user blocked by admin"})
            }
            
        } else {
            console.log("invalid user")
            return res.render("login",{message:"username or password dosen't match"})
        }
        
    } catch (error) {
        console.log("error in login verify "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
        
    }

    
}





//logut
const logout=async(req,res)=>{
    try {
        
        req.session.destroy((err)=>{
            if(err){
                console.log("error when distroy session cb "+err.message)
            }
            else{
                console.log("session destroy successfully")
                res.redirect('/')
            }
        })

            
    } catch (error) {
        return res.status(400).json({success:false,message:"an error occured"})
        console.log("error destroy session "+error.message)
    }
}

const forgotPassword=async(req,res)=>{
    try {
        let userName=await isUser.isUser(req)
        const message=req.query.message
        console.log("inside forgot password")
        console.log(message)
        res.render('forgotPassword',{message,userName})
    } catch (error) {
        console.log("error forgot password "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

async function sendResetPasswordEmail(email,resetURL){

    try {
        console.log("inside reset pasword email send")
        
        const transport= nodemail.createTransport({

            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })
        
        const info= await transport.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:'Password Reset Request',
            text:`You requested a password reset. Please click the following link to reset your password: ${resetURL} \n\nIf you did not request this, please ignore this email.`
            
        })
        
        return info.accepted.length > 0
        
    } catch (error) {
        
        console.log("sending email reset password"+error)
        return false
    }

}

const forgotEmailVarification=async(req,res)=>{
    try {
        
        console.log("iside forgot fetch")
        const {email}=req.body
        

        const User=await user.findOne({email:email})
        if(User){
            console.log("inside if")
            const resetToken = crypto.randomBytes(32).toString('hex');

        
            User.resetPasswordToken = resetToken
            User.resetPasswordExpires = Date.now() + 3600000; 
            await User.save()
           
            

            const resetURL=`http://localhost:4000/reset-password/${resetToken}`
           
            await sendResetPasswordEmail(email,resetURL)
            const Us=await user.findOne({email:email})
            console.log(Us)
            return res.status(200).json({success:true,message:"reset link send to email"})
        }else{
            return res.status(500).json({success:fail,message:"no user found",url:'/signup'})
        }

    } catch (error) {
        console.log("error forgot email varificatoin "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
        
    }
}

const resetPasswordForm=async(req,res)=>{
    try {
        const {token} =req.params
        console.log("inside reset password")
        console.log(token)
        const User=await user.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if(!User){
            console.log("no user found in reset form")
            return res.status(400).send('Invalid or expired token');
        }
        

        res.render("resetPasswordForm",{token})
    } catch (error) {
        console.log("error reset password form "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const resetPasswordSubmition=async(req,res)=>{
    try {
        console.log("inside resetpassword submition")
        const {token} =req.params
        const {password}=req.body
        console.log(token)
        console.log(password)
        const User=await user.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        console.log(User)
        if(!User){
            console.log("no user found reset submission")
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const passwordHash=await securePassword(password)
        console.log(passwordHash)
        User.password = passwordHash
        await User.save()

        return  res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        console.log("error reset password form "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}


module.exports = {
    loadHomepage,
    pageNotfound,
    loadLogin,
    loadSignup,
    signup,
    login,
    otpverification,
    resendOtp,
    logout,
    forgotPassword,
    forgotEmailVarification,
    resetPasswordForm,
    resetPasswordSubmition
}