const mongoose=require('mongoose')
const{Schema}=mongoose

const cartSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    productId:{
        type:Schema.Types.ObjectId,
        ref:"product"
    }
},{timestamps:true})

const Cart=mongoose.model("cart",cartSchema)
module.exports=Cart
