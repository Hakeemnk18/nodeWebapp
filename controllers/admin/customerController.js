const { search } = require('../../app')
const User=require('../../models/userSchema')

const customerInfo=async(req,res)=>{
    try {
        
        console.log(req.query)
        const search=req.query.search || "";
        const regex = new RegExp(`^${search}`, 'i');
        let page=req.query.page || 1
        const limit=2;
        const startIndex=(page-1)*limit
        const endIndex=page*limit
        const data=await User.find({
            role:"user",
            username:{ $regex: regex }
        })
        .limit(limit)
        .skip((page-1)*limit)
        .exec()

        const totalUsers=await User.find({
            role:"user",
            username:{ $regex: regex }
        }).countDocuments()

        const totalPage=Math.ceil(totalUsers/limit)
        const hasNextPage=endIndex<totalUsers
        const hasPrevPage=startIndex>0

        res.render("userManagement",{
            data,
            totalPage,
            currentPage:page,
            hasNextPage,
            hasPrevPage,

        })




    } catch (error) {
        console.log("error in customer info "+error.message)
    }
}

const userBlock=async(req,res)=>{

    try{
        const {id}=req.query
        const {page}=req.query
        
        await User.updateOne({_id:id},{$set:{isActive:false}})
        console.log("after block the user")
        

        res.redirect(`/admin/userManagement?page=${page}`)
    }catch(err){
        console.log("error in user block "+err.message)
    }
    
}

//user unblock
const userUnblock=async(req,res)=>{

    try{
        const {id}=req.query
        const {page}=req.query
        await User.updateOne({_id:id},{$set:{isActive:true}})
        console.log("after unblock the user ")
        
        res.redirect(`/admin/userManagement?page=${page}`)
    }catch(err){
        console.log("error in user unblock "+err.message)
    }
    
}


module.exports={
    customerInfo,
    userBlock,
    userUnblock
}


