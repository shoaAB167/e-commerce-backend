import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please enter coupon code"],
        unique: true
    },
    amount: {
        type: Number,
        required: [true, "Please enter the Discount Amount"],
        unique: true
    }
})

export const Coupon = mongoose.model("Coupon", couponSchema);