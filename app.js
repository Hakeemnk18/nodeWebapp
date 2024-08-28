const express=require('express')
const app=express()
const path=require('path')
const env=require("dotenv").config();
const session=require('express-session')
const passport=require('./config/passport')
const db=require('./config/db')
const userRouter=require('./routes/userRouter')
const adminRouter=require("./routes/adminRouter")
db()

app.use(express.json())
app.use(express.urlencoded({extends:true}))
//session handling
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.set("view engine","ejs")
app.set("views",[path.join(__dirname,'views/user'),path.join(__dirname,"/views/admin")])
app.use(express.static(path.join(__dirname,"public")))



app.use("/",userRouter)
app.use("/admin",adminRouter)
app.use(passport.initialize())
app.use(passport.session());



const PORT=process.env.PORT

app.listen(PORT,()=> console.log("server started"))


module.exports=app;

// const express=require("express")
// const app=express()

// app.get("/",(req,res)=>{
//     res.send("hello world")
// }).listen(4000,()=> console.log("server started"))
