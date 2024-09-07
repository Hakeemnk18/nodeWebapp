const isLogin=async(req,res,next)=>{
    try {
        console.log("inside is admin login")
        if(req.session.admin_id){}
        else{
            return res.redirect('/')
        }
        next()
    } catch (error) {
        console.log("error in isLogin admin "+error.message)
    }
}

const isLogout=async(req,res,next)=>{

    try {
        console.log("inside is admin logout")
        if(req.session.admin_id){
           return res.redirect('/admin')
        }
        next()
    } catch (error) {
        console.log("error in islogut in admin "+error.message)
    }
}

module.exports={
    isLogin,
    isLogout
}