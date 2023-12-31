const mongoose = require('mongoose');

const validator= require('validator');

const bcrypt = require("bcryptjs");

const jwt= require("jsonwebtoken");

const crypto= require("crypto")
const userSchema= new mongoose.Schema({

    name:{
        type: String,
        required:[true,"please enter your name"],
        maxLength:[30,"cannot exceed 30 characters"],
        minLength:[4,"should at least contain 4 characters"],

    },

    email:{
        type:String,
        required:[true,"please enter your email"],
        unique:true,
        validate:[validator.isEmail,"please enter valid email"]


    },

    password:{
        type: String,
        required:[true,"Please enter your password"],
        minLength:[8,"password should be 8 characters or greater than 8"],
        select:false,
    },

    avatar:{
        
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        

    },
    role:{
        type:String,
        default:"user",
    },

    resetPasswordToken:String,
    resetPasswordExpire: Date,

});

userSchema.pre("save",async function(next){
    //if password is not changed while updating other things except pw then it shouldnt be hased again

    if(!this.isModified("password"))
    {
        next();
    }
    //if password is changed then it should obv be hashed as its a new pw also it should be hashed when u enter a pw for the first time ever
    this.password= await bcrypt.hash(this.password,10)
});

//jwt token
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

//compare password
userSchema.methods.comparePassword=async function(enteredPassword){
    const result= await bcrypt.compare(enteredPassword,this.password);
     console.log(`result: ${result}`);
    return result;
}

//generating password reset token
userSchema.methods.getResetPasswordToken=function(){
    //generating token
    const resetToken= crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken= crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire=Date.now() + 15 * 60 * 1000;
    return resetToken;
}



module.exports=mongoose.model("User",userSchema)
