const User=require('../models/userSchema')

const isUser=async (req)=>{
    try {
        

        let userName;
        if(req.session.user_id){
            userName=await User.findOne({_id:req.session.user_id},{_id:0,username:1})
            
           
        }else{
            
        }
        
        return userName

    } catch (error) {
        console.log("error in is user helpper "+error.message)
    }
}

module.exports={
    isUser
}