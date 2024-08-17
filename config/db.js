const mogoose=require('mongoose');
const env = require('dotenv').config();


const connectDB=async ()=>{
    try{

        await mogoose.connect(process.env.MONGODB_URI)
        console.log("db connected")

    }catch(error){
        console.log("db connection error "+error)
    }
}

module.exports=connectDB;