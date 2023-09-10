const express=require("express");
const errorMidleware=require("./middleware/error")
const cookieParser= require("cookie-parser")
const app=express();
app.use(cookieParser())
app.use(express.json())
const product=require("./routes/productRoute")
const user=require("./routes/userRoute")
const order = require("./routes/orderRoute")
app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1/",order);

//middleware for errors
app.use(errorMidleware)
module.exports=app