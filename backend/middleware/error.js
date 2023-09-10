const ErrorHander=require('../utils/errorHander')


module.exports= (err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.message=err.message || "internal server error";


    //wwrong mongodb id error
    if(err.name==="CastError")
    {
        const message=`Resource not found. Invalid: ${err.path}`;
        err=new ErrorHander(message,400);    
    }


    //mongoose duplicate key error
    if(err.code===11000)
    {
        const message=`${Object.keys(err.keyValue)} already in use`;
        err = new ErrorHander(message,400);
    }

    if(err.name === 'jsonwebTokenError')
    {
        const message=`Json web token is invalid, please try again`;
        err = new ErrorHander(message,400);
    }
    //jwt expirederror
    if(err.name === 'TokenExpiredError')
    {
        const message=`Json web token is expired, please try again`;
        err = new ErrorHander(message,400);
    }
    res.status(err.statusCode).json({
        success:false,
        message:err.message,

    })
}