import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupon, newCoupon } from "../controllers/payment.js";

const app = express.Router();

// /api/payment/create
app.post("/create", createPaymentIntent)

// /api/v1/payment/coupon/new
app.get("/discount", applyDiscount)

// /api/v1/payment/coupon/new
app.post("/coupon/new",adminOnly, newCoupon)

// /api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly,allCoupons)

// /api/v1/payment/coupon/:id
app.delete("/coupon/:id",adminOnly, deleteCoupon)

export default app;


