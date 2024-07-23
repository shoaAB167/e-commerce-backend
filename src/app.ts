import express from "express"
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from 'node-cache'
import morgan from "morgan";
import {config} from 'dotenv'
import Stripe from "stripe";
import cors from 'cors'
//importing routers
import userRoutes from './routes/user.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/order.js'
import paymentRoutes from './routes/payment.js'
import dashboardRoutes from './routes/stats.js'


config({
    path:"./.env"
})

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || ""

connectDB(mongoURI);
export const stripe = new Stripe(stripeKey)

//stdTTL parameter from NodeCache used to store data in cache for some seconds
export const myCache = new NodeCache()

const app = express();
//Middleware to parse JSON bodies
app.use(express.json())
//showing request log on terminal
app.use(morgan("dev"))
app.use(cors())

app.get("/", (req, res) => {
    res.send("API working with /api/v1")
})
//using routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/product", productRoutes)
app.use("/api/v1/order", orderRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/dashboard", dashboardRoutes)

//serving static files
app.use("/uploads",express.static("uploads"))

//This function gets execute when we call next with first parameter as error
app.use(errorMiddleware)

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
})