const Product=require("../models/productModel");
const ErrorHander = require("../utils/errorHander");
const catchAsyncErrors=require("../middleware/catchasyncerror");
const ApiFeatures = require("../utils/apiFeatures");

//create a product--only admin
exports.createProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    });

});
//get all products
exports.getAllProducts=catchAsyncErrors(async(req,res)=>{
    const resultPerPgae=5;
    const productCount=await Product.countDocuments();

    const apiFeature= new ApiFeatures(Product.find(),req.query)
    .search().
    filter()
    .pagination(resultPerPgae);
    const products=await apiFeature.query;

    res.status(200).json({success:true,
        products});
});


//get product details(single rpoduct)
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product= await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHander("product not found",404));
        }
    


    res.status(200).json({
        sucess:true,
        product,
        productCount,
    });
});


//update product-- only admin

exports.updateProduct=catchAsyncErrors(async(req,res)=>{
    let product=Product.findById(req.params.id)

    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }

    product=await Product.findByIdAndUpdate(req.params.id,req.body,
        {new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        sucess:true,
        product
    });
});

//delete a product--only admin

exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id)

    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }

    product=await Product.findByIdAndRemove(req.params.id,req.body);

    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    });

});