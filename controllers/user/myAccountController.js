const User=require('../../models/userSchema')
const Address=require('../../models/addressSchema')


const myAccount=async (req,res)=>{
    try {
        
        let logout;
        if(req.session.user_id){
            logout="logout"
        }
        const userData=await User.findOne({_id:req.session.user_id})

        console.log(userData)
        res.render("userProfile",{logout,userData})

        
    } catch (error) {
        console.log("error in my account "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const addressManegment=async (req,res)=>{
    try {
        const addressData= await Address.find()
        
        res.render('address',{addressData})

    } catch (error) {
        
        console.log("error in addrest management "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

const loadAddadress=async (req,res)=>{

    try {
        res.render('addAddress')
    } catch (error) {
        console.log("error in addrest management "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}
const addAddress=async (req,res)=>{

    try {
        console.log(req.body)
        const newAddress=new Address({
            houseNumber:req.body.houseNumber,
            street:req.body.street,
            village:req.body.village,
            city:req.body.city,
            pincode:req.body.pincode,
            country:req.body.country,
        })

        const addressData=await newAddress.save()

        console.log(addressData)

        res.send("address addeded")
    } catch (error) {
        console.log("error in addrest management "+error.message)
        return res.status(400).json({success:false,message:"an error occured"})
    }
}

module.exports={
    myAccount,
    addressManegment,
    loadAddadress,
    addAddress
}