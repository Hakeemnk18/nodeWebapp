
const pageNotfound= async (req,res)=>{

    try{
        res.render("page-404")
    }catch(error){
        res.redirect("/pageNotfound")
    }
}




const loadHomepage = async (req,res)=>{

    try{
        return res.render("home")
    }catch(error){
        console.log("home page not found")
        res.status(500).send("Server error")
    }
}




module.exports={
    loadHomepage,
    pageNotfound,
}