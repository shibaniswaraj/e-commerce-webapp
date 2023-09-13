const Product=require("../models/productModel");
const ErrorHander = require("../utils/errorHander");
const catchAsyncErrors=require("../middleware/catchasyncerror");
const Order = require("../models/orderModel");


//Create a new Order

exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const{
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt : Date.now(),
        user: req.user._id,
    });
    res.status(200).json({
        sucess:true,
        order
    });
});

//get single order
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );//what this does is it finds the order jiska user ka id jo humne id diya hai wo hai and fir wo user ke database me jaake uss user ka email aur naam aur dega

    if(!order)
    {
     return next (new ErrorHander("Order not found") )};

     res.status(200).json({
        sucess:true,
        order
     });
});


//get logged in user's order
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user: req.user._id});

     res.status(200).json({
        sucess:true,
        orders
     });
});

//get all orders --admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find();
    let totalAmount =0;
    orders.forEach(order=>{
        totalAmount+= order.totalPrice;
    })

     res.status(200).json({
        sucess:true,
        totalAmount,
        orders
     });
});

//update orders --admin
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("You have already delivered this order",404))
    }
    if(!order){
        return next(new ErrorHander("Order not found",404));
    }

    order.orderItems.forEach(async(order)=>{
        await updateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered"){
        order.deliveredAt= Date.now();
    }

    await order.save({validateBeforeSave: false});

     res.status(200).json({
        sucess:true,
        
     });
});

async function updateStock(id,quantity)
{
    const product = await Product.findById(id);
    product.stock-=quantity;
    product.save({validateBeforeSave: false})
}

//delete orders --admin
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    let order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHander("Order not found",404));
    }
    
    order=await Order.findByIdAndRemove(req.params.id)

     res.status(200).json({
        sucess:true,
        message:"order deleted succefully",
        
     });
});