const ErrorHander = require("../utils/errorHander");
const catchAsyncErrors=require("../middleware/catchasyncerror");
const User= require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto");
const productModel = require("../models/productModel");

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
});


//forgot password

exports.forgotPassword= catchAsyncErrors(async(req,res,next)=>{
    const user= await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHander("User not found",404));
    }

    //get resetpw token
    const resetToken = await user.getResetPasswordToken();

    //saving resetPasswordToken in the resetPasswordToken field in user schema that will only be done after u call the func forgot pw but when u call that func the resetPasswordToken gets a value but it doesnt save that value next to that field in user schema
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl= `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = ` Please click on this link to recover your password :- \n\n ${resetPasswordUrl} \n\n`;

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
       user.resetPasswordExpire = undefined;
       await user.save({validateBeforeSave:false});
       
       return next(new ErrorHander(error.message,500));
    }
});

exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire :{ $gt: Date.now() },

    });
    if(!user){
        return next( new ErrorHander("Reset Password token is invalid or has been expired",404));
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new ErrorHander("Password does not match",404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
    
});

exports.getUserDetails= catchAsyncErrors(async(req,res,next)=>{
    const user= await User.findById(req.user.id);

    res.status(200).json({
        sucess:true,
        user

    })
});
//update user pw
exports.updateUserPassword= catchAsyncErrors(async(req,res,next)=>{
    const user= await User.findById(req.user.id).select("+password");
    const isPasswordMatched= await user.comparePassword(req.body.oldPassword);
    console.log(isPasswordMatched);

   if(!isPasswordMatched){
       return next(new ErrorHander("old password is incorrect",404))
   }
  
   if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHander("password does not match",400));
   }

   user.password= req.body.newPassword;

   await user.save();
   sendToken(user,200,res);
   

});


//update user profile
exports.updateUserProfile= catchAsyncErrors(async(req,res,next)=>{
   const newUserData={
    name:req.body.name,
    email: req.body.email,
   }

   //we will add clodiary later for avatar
   const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runvalidators:true,
    useFindAndModify:false});

    res.status(200).json({
        sucess:true,

    });


//    sendToken(user,200,res);
   

});

//get all users(admin)
exports.getAllUser= catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        sucess:true,
        users,
    })
})

// get single user(admin)
exports.getSingleUser= catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHander(`user not found with id: ${req.params.id}`,404))
    }

    res.status(200).json({
        sucess:true,
        user,
    })
})

//update user role
exports.updateUserRole= catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
     name:req.body.name,
     email: req.body.email,
     role: req.body.role
    }

    const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
     new:true,
     runvalidators:true,
     useFindAndModify:false});
 
     res.status(200).json({
         sucess:true,
 
     });
});

//delete user
exports.deleteUser= catchAsyncErrors(async(req,res,next)=>{
    let user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHander(`user does not exist with id ${req.params.id}`,404))
    }

    user=await User.findByIdAndRemove(req.params.id)
    res.status(200).json({
         sucess:true,
         message:"user deleted successfully"
 
     });

   
});