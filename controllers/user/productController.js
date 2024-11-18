const Product = require('../../models/productSchema')
const Category = require('../../models/category')
const Cart = require('../../models/cartSchema')
const User = require('../../models/userSchema')
const app = require('../../app')
const product = require('../../models/productSchema')
const Order = require('../../models/ordersSchema')
const isUser = require('../../helpers/isUserlogin')
const statusTime = require('../../helpers/orderStatusTime')
const Wishlist = require('../../models/wishlistSchema')
const wishlist = require('../../models/wishlistSchema')
const Coupon = require('../../models/couponSchema')
const Wallet = require('../../models/walletSchema')
const razorpayInstance = require('../../config/razorpayConfig');


// find stock according to the size
async function findStock(id, size) {
    try {

        const product = await Product.findOne({ _id: id }, { varient: 1, _id: 0 })

        const variant = product.varient.find(v => v.size === size)

        return variant.stock
    } catch (error) {
        console.log("error in find stock" + error.message)
    }
}

function findOfferPrice(pOffer, cOffer, price) {
    let pOfferVal = price;
    let cOfferVal = price;
    let offerPrice = price;

    if (pOffer.value !== 0
        && pOffer.startDate !== undefined
        && pOffer.endDate !== undefined
        && pOffer.startDate <= Date.now()
        && pOffer.endDate >= Date.now()) {


        if (pOffer.type === "percentage") {

            pOfferVal = Math.floor(price * (1 - pOffer.value / 100))
        } else if (pOffer.type === "flat") {

            if (pOffer.value >= 0.8 * price) {

                pOfferVal = price;
            } else {

                pOfferVal = price - pOffer.value;
            }
        }
    }

    if (cOffer.value !== 0
        && cOffer.startDate !== undefined
        && cOffer.endDate !== undefined
        && cOffer.startDate <= Date.now()
        && cOffer.endDate >= Date.now()) {

        if (cOffer.type === "percentage") {
            cOfferVal = Math.floor(price * (1 - cOffer.value / 100))
        } else if (cOffer.type === "flat") {
            if (cOffer.value >= 0.8 * price) {
                cOfferVal = price;
            } else {
                cOfferVal = price - cOffer.value;
            }
        }
    }



    // If both offers are applicable, take the lower of the two values
    if (pOfferVal < price || cOfferVal < price) {
        offerPrice = Math.min(pOfferVal, cOfferVal);
    }

    console.log("offerPrice:", offerPrice);
    return offerPrice;
}


const productDetails = async (req, res) => {
    try {

        console.log("inside product details")
        const { id } = req.query
        let message;
        if (req.query.message) {
            message = req.query.message;
        }

        let userName = await isUser.isUser(req)
        const productDat = await Product.findOne({ _id: id })
        const relatedProduct = await Product.find({ category: productDat.category })

        const categoryData = await Category.findById(productDat.category)


        const offerPrice = findOfferPrice(productDat.offer, categoryData.offer, productDat.price)
        console.log("offer price in side product details :" + offerPrice)
        const productData = await Product.findByIdAndUpdate(id, { $set: { offerPrice: offerPrice } }, { new: true })

        res.render('productDetails', { productData, relatedProduct, userName, message })
    } catch (error) {
        console.log("error in product details page " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}
const stockDetails = async (req, res) => {
    try {


        const { id, size } = req.query


        const stock = await findStock(id, size)

        res.json({ stock })
    } catch (error) {
        console.log("error in stock fetching page " + error.message)
        res.status(404).json({ error: 'Product not found or index out of range' })
    }
}


const addCart = async (req, res) => {
    try {





        const { id, quantity } = req.query
        const sizeVal = req.query.size
        const userId = req.session.user_id

        if (req.query.remove) {
            await Wishlist.deleteOne({ productId: id, size: sizeVal, userId: userId })
            console.log("delete one product in wishlist")
        }
        const stock = await findStock(id, sizeVal)


        const productData = await Product.findById(id)


        if (stock < quantity) {
            console.log("stock is empty")
            return res.redirect(`/productDetails?id=${id}`);
        }
        const size = sizeVal


        const cart = await Cart.find({ userId: userId })

        let flag = 0

        if (cart.length > 0) {
            for (const carts of cart) {

                if (carts.productId == id && carts.size === size) {
                    console.log("a cart avaliable just increase the quntity")
                    await Cart.updateOne({ userId: userId, productId: id, size: size }, { $inc: { quantity: quantity } })
                    flag = 1

                }

            }
        }
        if (cart.length < 1 || flag === 0) {
            const newCart = new Cart({
                userId: userId,
                productId: id,
                size: size,
                quantity: quantity
            })
            const cartData = await newCart.save()
        }




        await Product.updateOne({ _id: id, "varient.size": size }, { $inc: { "varient.$.stock": -quantity } })




        res.redirect('/productDetails/cart')


    } catch (error) {
        console.log("error in addCart " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}
const updateCartQty = async (req, res) => {
    try {
        const { id, productId, size } = req.query

        const result = await Product.find({ _id: productId, "varient.size": size }, { _id: 0, "varient.$": 1 })
        const stock = result[0]?.varient?.[0]?.stock

        if (stock < 1) {
            return res.status(200).json({ success: false, message: "Out of stock" })
        }
        await Cart.findByIdAndUpdate(id, { $inc: { quantity: 1 } })
        await Product.updateOne({ _id: productId, "varient.size": size }, { $inc: { "varient.$.stock": -1 } })
        return res.status(200).json({ success: true })

    } catch (error) {
        console.log("error in cart plus one qty " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}
const removeCart = async (req, res) => {
    try {

        const { id, size, productId } = req.query
        const userId = req.session.user_id
        let theProduct = await Product.findById(productId, { varient: 1 })

        if (req.query.qty) {
            await Cart.deleteOne({ _id: id })
            const sizekey = `varient.${size}.stock`

            const data = await Product.findOneAndUpdate(
                { _id: productId, "varient.size": size },
                { $inc: { "varient.$.stock": req.query.qty } },
                { new: true }
            );

        } else {
            await Cart.findByIdAndUpdate(id, { $inc: { quantity: -1 } })
            await Product.updateOne({ _id: productId, "varient.size": size }, { $inc: { "varient.$.stock": 1 } })
            return res.status(200).json({ success: true })
        }


        res.redirect('/productDetails/cart')

    } catch (error) {
        console.log("error in remove cart " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}
const cart = async (req, res) => {
    try {


        const userId = req.session.user_id;
        let userName = await isUser.isUser(req);
        const allCart = await Cart.find({ userId: userId })
        const cartData = await Cart.find({ userId: userId }).populate('productId')






        res.render('addtoCart', { cartData, userName });


    } catch (error) {
        console.log("error in cart " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}

const allProduct = async (req, res) => {

    try {



        const page = parseInt(req.query.page) || 1

        const { sort } = req.query
        const search = (req.query.search || '').trim();
        const regex = new RegExp(`^${search}`, 'i');
        const query = { isActive: true, name: { $regex: regex } };

        let categoryFillter = req.query.filter
        console.log(req.query)
        if (categoryFillter) {
            categoryFillter = categoryFillter.trim()
            query.category = categoryFillter
            console.log("category filter : " + categoryFillter)

        }


        console.log(query)


        const category = await Category.find()


        const limit = 6
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        let userName = await isUser.isUser(req)


        const productCount = await Product.find(query).countDocuments()

        let sortCriteria = {}
        if (sort === 'lowtohigh') {
            sortCriteria = { price: 1 }
        } else if (sort === "hightolow") {
            sortCriteria = { price: -1 }
        } else if (sort === "A to Z") {
            sortCriteria = { name: 1 }
        } else if (sort === "Z to A") {
            sortCriteria = { name: -1 }
        } else if (sort === "New Arrivals") {
            sortCriteria = { createdAt: -1 }
        }

        const allProduct = await Product.find(query)
            .sort(sortCriteria)
            .limit(limit)
            .skip(startIndex)
            .exec()

        const totalPages = Math.ceil(productCount / limit)


        res.render('allProduct', {
            allProduct,
            currentPage: page,
            hasNextPage: endIndex < productCount,
            hasPrevPage: startIndex > 0,
            totalPages,
            sort,
            search,
            userName,
            cart,
            category
        })

    } catch (error) {
        console.log("error in allproduct " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}

const checkout = async (req, res) => {
    try {

        console.log("inside checkout")




        let userName = await isUser.isUser(req)
        const userId = req.session.user_id
        const user = await User.findById(userId).populate({ path: 'address', match: { isActive: true } }).exec()
        const cartProduct = await Cart.find({ userId: userId }).populate('productId')
        const walletBalance = await Wallet.findOne({ userId: userId })

        //console.log(walletBalance)
        //console.log(cartProduct)
        let total = cartProduct.reduce((acc, cur) => {

            acc += cur.quantity * cur.productId.offerPrice

            return acc
        }, 0)



        const percentageOfTotal = total * 0.8;

        const availableCoupon = await Coupon.find({
            minCartValue: { $lt: total },
            isActive: true,
            expiresAt: { $gt: Date.now() },
            $expr: {
                $or: [
                    { $ne: ["$discountType", "fixed"] },
                    { $lt: ["$discoundValue", percentageOfTotal] }
                ]
            }
        });




        if (cartProduct.length === 0) {
            return res.redirect('/products')
        }
        res.render('checkout', { userName, cartProduct, addresses: user.address, availableCoupon, walletBalance })
    } catch (error) {
        console.log("error in checkout " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}

const couponApply = async (req, res) => {
    try {
        console.log("inside fetch coupon")
        console.log(req.body)
        const { coupon, total } = req.body
        const couponData = await Coupon.findById(coupon)
        console.log(couponData)
        let updatedTotal;
        let savedAmount;
        let couponName = couponData.code
        if (couponData.discountType === 'percentage') {

            const discountAmount = (couponData.discoundValue / 100) * total;
            savedAmount = discountAmount
            console.log("saved amount " + savedAmount)
            updatedTotal = total - discountAmount;
        } else if (couponData.discountType === 'fixed') {

            updatedTotal = Math.max(total - couponData.discoundValue, 0);
            savedAmount = couponData.discoundValue
            console.log("saved amount " + savedAmount)
        } else {

            updatedTotal = total;
        }
        console.log("Updated Total:", updatedTotal);

        res.status(200).json({ updatedTotal, savedAmount, couponName })
    } catch (error) {
        console.log("error in coupon apply " + error.message)
        res.status(500)
    }
}


function generateUniqueOrderId() {
    const prefix = 'ORD';
    const timestamp = Date.now();
    const randomChars = Math.random().toString(36).substr(2, 5).toUpperCase(); // Generate 5 random characters

    return `${prefix}-${timestamp}-${randomChars}`;
}

const orderSubmission = async (req, res) => {
    try {

        console.log("inside order submission")
        const user_id = req.session.user_id;
        const cartItems=await Cart.find({userId:user_id})
        
        if(cartItems.length === 0){
            return res.status(400).json({ success: false, message: "cart is empty" });
        }
       
        const { productIds, productQty, productPrice, address, totalAmount, cartIds, productSize, paymentMethod, walletUsedAmount,
            productOfferPrice, couponSaved, tax,
        } = req.body;
        let eachWallet = []
        let eachCoupon = []
        let totalOfferPrice = 0

        for (let i = 0; i < productOfferPrice.length; i++) {
            totalOfferPrice += parseInt(productOfferPrice[i]) * parseInt(productQty[i])
        }

        //console.log(totalOfferPrice)

        for (let i = 0; i < productOfferPrice.length; i++) {

            eachCoupon.push(Math.ceil((parseInt(productOfferPrice[i]) * parseInt(productQty[i]) / totalOfferPrice) * couponSaved))

            eachWallet.push(Math.ceil((parseInt(productOfferPrice[i]) * parseInt(productQty[i]) / totalOfferPrice) * walletUsedAmount))

        }

        
        // console.log(totalOfferPrice)

        const payableAmount=Math.ceil((totalOfferPrice * 1.1)-couponSaved-walletUsedAmount)    
        // console.log(payableAmount)
        // console.log(totalAmount)
        

       


        const productDetails = [];
        for (let i = 0; i < productIds.length; i++) {
            productDetails.push({
                product: productIds[i],
                quantity: productQty[i],
                price: productPrice[i],
                cartId: cartIds[i],
                size: productSize[i],
                offerPrice: productOfferPrice[i],
                offerDiscount: productPrice[i] - productOfferPrice[i],
                couponDiscount: eachCoupon[i],
                walletAmount: eachWallet[i],
                finalAmount: Math.ceil(((parseFloat(productOfferPrice[i]) * parseFloat(productQty[i])) * 1.1) - eachCoupon[i])

            });
        }

        //console.log(productDetails)
        const orderId = generateUniqueOrderId();
        

        if (paymentMethod === "Cod" || totalAmount === '0') {

            const order = new Order({
                user: user_id,
                cartItems: productDetails,
                address: address,
                totalPrice: payableAmount+walletUsedAmount,
                orderId: orderId,
                paymentMethod: "COD",
                paymentStatus: "Success",
                walletAmount: walletUsedAmount,
                tax: tax,
                payableAmount:payableAmount
            });
            const orderData = await order.save();

            await statusTime.statusTime('Pending', orderData._id)
            await statusTime.statusTime('Processing', orderData._id)


            const orderDat = await Order.findOne({ _id: orderData._id })

            console.log(orderDat)

            if (walletUsedAmount) {
                console.log("inside wallet deduction cod")

                const obj = {
                    amount: walletUsedAmount,
                    type: "withdrawal",
                    date: new Date()
                };

                const neworderdata = await Order.findOneAndUpdate({ _id: orderData._id }, { $set: { walletUsed: true } }, { new: true })

                const newWalletData = await Wallet.findOneAndUpdate(
                    { userId: neworderdata.user },

                    {
                        $inc: {
                            balance: -walletUsedAmount
                        },
                        $push: {
                            transactions: obj
                        }
                    }
                )



            }

            
            await Cart.deleteMany({ userId: user_id });

            return res.status(200).json({
                success: true,

            });
        
        } else if (paymentMethod === "Razorpay") {

            console.log("inside else if")
            const options = {
                amount: payableAmount * 100,
                currency: "INR",
                receipt: orderId,
                payment_capture: 1
            };
            console.log("inside else if")
            const razorpayOrder = await razorpayInstance.orders.create(options);


            const order = new Order({
                user: user_id,
                cartItems: productDetails,
                address: address,
                totalPrice: payableAmount+walletUsedAmount,
                orderId: orderId,
                razorpayOrderId: razorpayOrder.id,
                paymentMethod: "Razorpay",
                paymentStatus: "Pending",

                orderStatus: 'Processing',
                walletAmount: walletUsedAmount,
                tax: tax,
                payableAmount:payableAmount
            });
            console.log("order created")
            const orderData = await order.save();

            await statusTime.statusTime('Pending', orderData._id)


            await Cart.deleteMany({ userId: user_id });

            res.status(200).json({
                success: true,
                orderId: razorpayOrder.id,
                amount: totalAmount,
                currency: "INR",
                orderData
            });
            console.log("status sended")
        } else {
            console.log("")
            return res.status(400).json({ success: false, message: "Invalid payment method" });
        }

    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
};

const orderVarification = async (req, res) => {
    try {
        console.log("inside fetch for order verification")
        console.log(req.body)
        const { orderId } = req.body
        const orderData = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { paymentStatus: "Success" } },
            { new: true }
        );
        await statusTime.statusTime('Processing', orderData._id)
        console.log(orderData)

        if (orderData.walletAmount) {


            const obj = {
                amount: orderData.walletAmount,
                type: "withdrawal",
                date: new Date()
            };
            console.log("amount minus in wallet " + orderData.walletAmount)
            const neworderdata = await Order.findOneAndUpdate({ _id: orderData._id }, { $set: { walletUsed: true } }, { new: true })
            console.log(neworderdata)
            const newWalletData = await Wallet.findOneAndUpdate(
                { userId: neworderdata.user },

                {
                    $inc: {
                        balance: -orderData.walletAmount
                    },
                    $push: {
                        transactions: obj
                    }
                }
            )

            console.log(newWalletData)

        }

        // await Cart.deleteMany({ userId: orderData.user });
        return res.status(200).json({ success: true })
    } catch (error) {
        console.log("Error in order verification: " + error.message);
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
}

const razorpayRepayment=async(req,res)=>{
    try {
        console.log("inside repayment ")
        console.log(req.body)
        const {orderId}=req.body
        const order = await Order.findById(orderId);
        console.log(order)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

       console.log("before option")
        const options = {
            amount:order. payableAmount * 100,
            currency: "INR",
            receipt: orderId,
            payment_capture: 1
        };
        console.log("after option")
        const razorpayOrder = await razorpayInstance.orders.create(options);

        console.log("instance create")
        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: order.payableAmount,
            currency: "INR",
        });
    } catch (error) {
        console.log( error);
        return res.status(400).json({ success: false, message: "An error occurred" });
    }
}


const orderSuccess = async (req, res) => {
    try {
        let userName = await isUser.isUser(req)
        res.render("orderSuccess", { userName })
    } catch (error) {
        console.log("error in order success " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}

const addWishlist = async (req, res) => {
    try {

        const { id, size } = req.body
        const userId = req.session.user_id
        const cartProduct = await Cart.findOne({ userId: userId, productId: id, size: size })

        const wishlistProduct = await Wishlist.findOne({ userId: userId, productId: id, size: size })


        if (cartProduct === null && wishlistProduct === null) {

            console.log("not  in your cart")

            const newWishlist = new Wishlist({
                userId: userId,
                productId: id,
                size: size
            })
            const wishlistdata = await newWishlist.save()

            return res.status(200).json({ success: true, message: " Added Wishlist  successfully" });
        } else {
            console.log("allr redy in your cart")
            return res.status(200).json({ success: false, message: "Product allready in your cart or wishlist" });
        }


    } catch (error) {
        console.log("error in add wishlist " + error.message)
        res.status(500).json({ message: "Error adding to wishlist" });
    }
}
const renderWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        let userName = await isUser.isUser(req)
        wishlistItems = await Wishlist.find({ userId: userId }).populate('productId')
        console.log(wishlistItems)
        res.render("wishlist", { wishlistItems, userName })
    } catch (error) {
        console.log("error in render the wishlist " + error.message)
        return res.status(400).json({ success: false, message: "an error occured" })
    }
}

const removeWishlist = async (req, res) => {
    try {
        console.log("inside fetch remove whishlist")
        console.log(req.body)
        const id = req.body.Id
        if (!id) {
            return res.status(400).json({ success: false, message: "Wishlist ID is required" })
        }
        const result = await wishlist.findByIdAndDelete(id)
        if (!result) {
            return res.status(400).json({ success: false, message: "Wishlist item not found" })
        }
        return res.status(200).json({ success: true, message: "wishlist removed" })
    } catch (error) {
        console.log("allr redy in your cart")
        return res.status(500).json({ success: false });
    }
}

module.exports = {
    productDetails,
    addCart,
    allProduct,
    cart,
    removeCart,
    checkout,
    orderSubmission,
    orderSuccess,
    stockDetails,
    updateCartQty,
    addWishlist,
    renderWishlist,
    removeWishlist,
    couponApply,
    orderVarification,
    razorpayRepayment
}



