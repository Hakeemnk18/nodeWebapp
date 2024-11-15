const express=require('express')
const app=express()
const path=require('path')
const env=require("dotenv").config();
const session=require('express-session')
const passport=require('./config/passport')
const db=require('./config/db')
const userRouter=require('./routes/userRouter')
const adminRouter=require("./routes/adminRouter")
const nocache=require('nocache');
const Order = require('./models/ordersSchema');
db()

app.use(express.json())
app.use(express.urlencoded({extends:true}))
app.use(nocache())

//session
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

// app.listen(port,(console.log("port running 4000")))


app.use("/admin",adminRouter)
app.use("/",userRouter)
app.use(passport.initialize())
app.use(passport.session());



const PORT=process.env.PORT

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});


module.exports=app;



