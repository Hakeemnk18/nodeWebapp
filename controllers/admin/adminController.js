
const productManagment=async (req,res)=>{

    console.log("controller")
    try{
        return res.render("productManagment")
    }catch(err){
        console.log("product managment "+err.message)
    }
}

module.exports={
    productManagment,
}