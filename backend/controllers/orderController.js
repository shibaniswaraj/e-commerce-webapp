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
    const order = await Order.find({user: req.user._id});

     res.status(200).json({
        sucess:true,
        order
     });
});