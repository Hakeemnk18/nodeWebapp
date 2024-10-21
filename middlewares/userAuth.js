const User=require('../models/userSchema')

const isLogin=async(req,res,next)=>{
    try {

        console.log("inside user login")
        if(req.session.user_id ){
            const isActive=await User.findById(req.session.user_id)
            console.log(isActive)
            if(isActive.isActive){

            }else{

                try {
                    await req.session.destroy()
                    console.log("session destroy successfully")
                    return res.redirect('/')
                } catch (error) {
                    console.log("error in session destroy "+error)
                }
                
                
                
            }
        }
        else{
            return res.redirect('/')
        }
        next()
    } catch (error) {
        
        console.log('error in is login user '+error.message)
    }
}

const isLogout=async(req,res,next)=>{
    try {
        console.log("inside user logout")
        if(req.session.user_id){
            console.log(req.session)
            return res.redirect('/')
        }
        next()
    } catch (error) {
        console.log("error in is logout user "+error.message)
    }
}



module.exports={
    isLogin,
    isLogout
}