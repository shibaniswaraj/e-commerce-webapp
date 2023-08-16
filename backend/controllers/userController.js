const ErrorHander = require("../utils/errorHander");
const catchAsyncErrors=require("../middleware/catchasyncerror");
const User= require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js")

//register a user

exports.registerUser=catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password}=req.body;
    const user=await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl",
        },
    });

    sendToken(user,201,res);
});
//login user
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}= req.body;

    //checking if user has given pw n email both

    if(!email||!password)
    {
        return next(new ErrorHander("Please enter email and password",400))

    }

    //bcz weve done pw select:false thtas why gotta use +
    const user= await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHander("Invalid Email or Password",404));
    }

    const isPasswordMatched= await user.comparePassword(password);
     console.log(isPasswordMatched);

    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid email or password",404))
    }
   
   sendToken(user,200,res);
    




});



//log out user

exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httponly: true,
    })
    
    res.status(200).json({
        success:true,
        message:"logout successfully"
    })
})


//forgot password

exports.forgotPassword= catchAsyncErrors(async(req,res,next)=>{
    const user= await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHander("User not found",404));
    }

    //get resetpw token
    const resetToken = user.getResetPasswordToken();

    //saving resetPasswordToken in the resetPasswordToken field in user schema that will only be done after u call the func forgot pw but when u call that func the resetPasswordToken gets a value but it doesnt save that value next to that field in user schema
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl= `${req.protocol}://${req.get("host")}/api/1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if youve not requested this email,then ignore it`;

    try{

        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,

        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })

    }catch(error){
       user.resetPasswordToken= undefined;
       user.resetPasswordToken = undefined;
       await user.save({validateBeforeSave:false});
       
       return next(new ErrorHander(error.message,500));
    }
})