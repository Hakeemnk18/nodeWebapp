const mongoose=require('mongoose')

const {Schema}=mongoose

const wishlistSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    productId:{
        type:Schema.Types.ObjectId,
        ref:"product"
    },
    size:{
        type:String,
        required:true
    },
},{timestamps:true})

const wishlist=mongoose.model("wishlist",wishlistSchema)

module.exports=wishlist