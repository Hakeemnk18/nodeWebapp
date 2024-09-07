const user = require('../../models/userSchema')
const Product=require('../../models/productSchema')
const bcrypt = require('bcrypt');
const { CommandSucceededEvent } = require('mongodb');
const nodemail=require('nodemailer')
const env=require("dotenv").config();

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
        res.render("page-404")
    } catch (error) {
        console.log("err in pagenot found")
        res.redirect("/pageNotfound")
    }
}


const loadHomepage = async (req, res) => {

    try {
        let logout;
        const product=await Product.find()
        if(req.session.passport){
            
            req.session.user_id=req.session.passport.user
            
        }
        if(req.session.user_id){
            logout="logout"
        }
        
        console.log(product[0].productImage[0].filename)
        return res.render("home",{logout,product})
    } catch (error) {
        console.log("err in load Home page "+error.message)
        res.status(500).send("Server error")
    }
}




// render the signup page get 
const loadSignup = async (req, res) => {

    try {
        return res.render("signup")
    } catch (error) {
        console.log("err in load signup page" + error)
        res.status(500).send("Server error")
    }
}



//otp genarotore
function genareteOtp(){
    return Math.floor(100000 + Math.random()*90000).toString()
}

//send otp to email
async function sendVerificationEmail(email,otp){

    try {
        console.log(otp)
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
        if(userData){
            return res.render('signup', { message: "User with this email already exists" });
        }
        
        const otp=genareteOtp()
        console.log("after genarationg otp "+otp)
        const emailSend=await sendVerificationEmail(email,otp)
        if(!emailSend){
            return res.json("email.error")
        }
        
        req.session.userOtp=otp;
        req.session.userData={email,password,phone,username};
        console.log(req.session)

        res.render("verify-otp")


    }catch(error){
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
    }
}

//  load login page

const loadLogin = async (req, res) => {

    try {
        return res.render("login")
    } catch (err) {
        console.log("err in load login page " + err)
        res.status(500).send("Server error")
    }
}

// verify the user
const login = async (req, res) => {

    const { username, password } = req.body

    const userData = await user.findOne({ username: username, isActive: true })
    
    if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (passwordMatch) {
            if (userData.role === "admin") {
                req.session.admin_id=userData._id
                
                return res.redirect("/admin")
            }
            req.session.user_id=userData._id
            
            return  res.redirect("/")
        }
    } else {
        res.send("invalid usename")
    }
}

//product details
const productDetails=async (req,res)=>{
    try {
        res.render('productDetails')
    } catch (error) {
       console.log("error in product details page "+error.message) 
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
    productDetails,
}