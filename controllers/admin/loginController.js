const user=require('../../models/userSchema')
const bcrypt = require('bcrypt');


const adminLoginLoading=async(req,res)=>{
    try {
        return res.render('adminLogin')
    } catch (error) {
        console.log("error in admin login")
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const veryfing=async(req,res)=>{
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
                        req.session.role=userData.role
                        
                        return res.redirect("/admin")
                    }
                    // req.session.user_id=userData._id
                    // req.session.role=userData.role
                    
                    // return  res.redirect("/")
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
        console.log("error in admin login verify "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
        
    }
}

module.exports={
    adminLoginLoading,
    veryfing
}
