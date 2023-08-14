const app=require("./app");
const dotenv=require("dotenv");
const connectDatabase= require("./config/database")


//handling uncaught exception

process.on("uncaughtException",err=>{
    console.log(`error: ${err.message}`);
    console.loh("server shutting down due to uncaught exception");
    process.exit(1);
})

dotenv.config({path:"backend/config/config.env"})
connectDatabase()
const server=app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})


//unhandled promise rejection

process.on("unhandledRejection",err=>{
    console.log(`error:  ${err.message}`);
    console.log("server shutting down due to unhandled promise rejection");
    server.close(()=>{
        process.exit(1);
    });
});