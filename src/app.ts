import express from "express"



//importing routers
import userRoutes from './routes/user.js'

const port  = 4000;
const app = express();

app.get("/",(req,res)=>{
    res.send("API working with /api/v1")
})
//using routes
app.use("/api/v1/user",userRoutes)

app.listen(port,() => {
    console.log(`Server is working on http://localhost:${port}`);
})