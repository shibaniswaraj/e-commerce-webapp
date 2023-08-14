const express=require("express");
const errorMidleware=require("./middleware/error")


const app=express();
app.use(express.json())
const product=require("./routes/productRoute")
const user=require("./routes/userRoute")
app.use("/api/v1",product);
app.use("/api/v1",user);

//middleware for errors
app.use(errorMidleware)
module.exports=app