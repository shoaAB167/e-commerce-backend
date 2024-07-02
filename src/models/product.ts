import mongoose, { Path } from "mongoose";

interface IProduct extends Document {
    name: string,
    photo: string,
    price: number,
    stock: number,
    category: string,
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter Name"]
        },
        photo: {
            type: String,
            required: [true, "Please enter Photo"]
        },
        price: {
            type: Number,
            required: [true, "Please enter price"]
        },
        stock: {
            type: Number,
            required: [true, "Please enter stock"]
        },
        category: {
            type: String,
            required: [true, "Please enter category"],
            trim: true
        },
    }, {
    timestamps: true
})


export const Product = mongoose.model<IProduct>("Product", productSchema)
