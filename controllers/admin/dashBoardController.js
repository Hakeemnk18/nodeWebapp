const Product=require("../../models/productSchema")
const Order=require("../../models/ordersSchema")
const User=require("../../models/userSchema")

const dashBoard=async(req,res)=>{
    try {
        const orders=await Order.find()
        console.log(orders [0])
        let revanue=0
        let sales=0
        const product=await Product.countDocuments()
        const users=await User.countDocuments()
        for(let i=0;i<orders.length;i++){
            for(let j=0;j<orders[i].cartItems.length;j++){
                console.log(orders[i].cartItems[j].quantity)
                sales += orders[i].cartItems[j].quantity
            }
            revanue += orders[i].payableAmount
        }
        console.log("revanue "+revanue)
        console.log("sales : "+sales)
        res.render('adminDashboard',{sales,revanue,product,users})
    } catch (error) {
        console.log("error in dashboard "+error.message)
    }
}

const graphData=async(req,res)=>{
    try {
        
        console.log("inside graph data")
        const{filter}=req.query
        let startDate;
        let endDate = new Date(); // Current date
        const data={}

        if (filter === 'today') {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
        } else if (filter === 'monthly') {
            startDate = new Date();
            startDate.setDate(1); // Start of the month
        } else if (filter === 'yearly') {
            startDate = new Date();
            startDate.setMonth(0); // Start of the year
            startDate.setDate(1);
        } else {
            return res.status(400).json({ error: 'Invalid filter' });
        }

        const topProductsWithDetails = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $unwind: "$cartItems"
            },
            {
                $group: {
                    _id: "$cartItems.product",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "products",  
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    "productDetails.name": 1,  
                    "productDetails.category": 1
                }
            }
        ]);

        const topCategoryWithDetails = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $unwind: "$cartItems"
            },
            {
                $group: {
                    _id: "$cartItems.product",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "products",  
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    "productDetails.name": 1,  
                    "productDetails.category": 1
                }
            },
            {
                $group:{
                    _id:"$productDetails.category",
                    count:{$sum:1}
                }
            },
            {
                $lookup:{
                    from:"categories",
                    localField:"_id",
                    foreignField:"_id",
                    as:"categoryDetails"
                }   
            },
            {
                $unwind:"$categoryDetails"
            },
            {
                $project:{
                    _id:1,
                    count:1,
                    "categoryDetails.categoryName":1
                }
            }
        ]);
        data.products=[]
        data.categories=[]
        for(let count of topProductsWithDetails){
            data.products.push(count.count)
        }
        for(let count of topCategoryWithDetails){
            data.categories.push(count.count)
        }
        console.log(data)
        return res.json(data); 

    } catch (error) {
        console.log("error in graph data"+error.message)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const salesReport=async(req,res)=>{
    try {
        res.render("salesReport")
    } catch (error) {
        console.log("error in graph data"+error.message)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const fetchSales=async(req,res)=>{
    try {
        const{filter}=req.query
        const data=[{totalordes:0},{couponApplyed:0},{cod:0},{online:0},{delivered:0},{offerAplyed:0}]
        let startDate;
        let endDate = new Date();
        if (filter === 'today') {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
        } else if (filter === 'monthly') {
            startDate = new Date();
            startDate.setDate(1); // Start of the month
        } else if (filter === 'yearly') {
            startDate = new Date();
            startDate.setMonth(0); // Start of the year
            startDate.setDate(1);
        } else {
            return res.status(400).json({ error: 'Invalid filter' });
        }

       
        const orders=await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $unwind:"$cartItems"
            }
        ])

        data[0].totalordes = await Order.countDocuments({ orderDate: { $gte: startDate, $lt: endDate } });
        

        for(let i=0;i<orders.length;i++){
            if(orders[i].paymentMethod === 'COD'){
                data[2].cod  += orders[i].cartItems.finalAmount
            }else{
                data[3].online  += orders[i].cartItems.finalAmount
            }

            if(orders[i].cartItems.orderStatus === 'Delivered'){
                data[4].delivered += 1
            }
            data[1].couponApplyed += orders[i].cartItems.couponDiscount
            data[5].offerAplyed += orders[i].cartItems.offerDiscount

        }
        
        const allOrders=await Order.find({ orderDate: { $gte: startDate, $lt: endDate } }).populate("cartItems.product")
        
        return res.json(allOrders)

    } catch (error) {
        console.log("error in sales report data "+error.message)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports={
    dashBoard,
    graphData,
    salesReport,
    fetchSales

}