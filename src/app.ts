import express from "express"
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

//importing routers
import userRoutes from './routes/user.js'
import productRoutes from './routes/products.js'

const port = 4000;
const app = express();
connectDB();

//Middleware to parse JSON bodies
app.use(express.json())

app.get("/", (req, res) => {
    res.send("API working with /api/v1")
})
//using routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/product", productRoutes)

//serving static files
app.use("/uploads",express.static("uploads"))
//This function gets execute when we call next with first parameter as error
app.use(errorMiddleware)

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
})