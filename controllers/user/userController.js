const user = require('../../models/userSchema')
const Product=require('../../models/productSchema')
const bcrypt = require('bcrypt');
const { CommandSucceededEvent } = require('mongodb');
const nodemail=require('nodemailer')
const env=require("dotenv").config();
const isUser=require('../../helpers/isUserlogin')


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


const loadHomepage = async (req, res) => {

    try {
        
        const product=await Product.find({isActive:true})
        const latestProduct=await Product.find({})
        .sort({createdAt:-1})
        .limit(8)
        .exec()
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
            const newUser=new user({
                username:User.username,
                password:passwordHash,
                email:User.email,
                phoneNumber:User.phone
            })

            const userData= await newUser.save()
            req.session.user_id=userData._id
            req.session.role=userData.role
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
        return res.status(400).json({success:false,message:"an error occured"})
        console.log("error in resend otp "+error.message)
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

const forgotEmailVarification=async(req,res)=>{
    try {
        
        const {email}=req.body

        const data=await user.findOne({email:email})
        if(data){
            return res.send("mail varified")
        }else{
            return res.redirect('/forgotPassword?message=no user found',)
        }

    } catch (error) {
        console.log("error forgot email varificatoin "+error.message)
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
    forgotEmailVarification
}