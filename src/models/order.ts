import mongoose from "mongoose";
interface IOrder extends Document {
   shippingInfo: {
       address: string;
       city: string;
       state: string;
       country: string;
       pinCode: number;
   };
   user: string;
   subtotal: number;
   tax: number;
   shippingCharges: number;
   discount: number;
   total: number;
   status: "Processing" | "Shipped" | "Delivered";
   orderItems: {
       name: string;
       photo: string;
       price: number;
       quantity: number;
       productId: mongoose.Types.ObjectId;
   }[];
   createdAt: Date;
   updatedAt: Date;
}
const orderSchema = new mongoose.Schema(
    {
     shippingInfo:{
        address : {
            type : String,
            required : true,
        },
        city : {
            type: String,
            required : true
        },
        state : {
            type: String,
            required : true
        },
        country : {
            type: String,
            required : true
        },
        pinCode : {
            type: Number,
            required : true
        }
     },
     //userId
     user : {
        //mongoose.Types.ObjectId : monggose object id type, in our case we are taking custom id as string
        type : String,
        ref : "User",
        required : true     
     },
     subtotal : {
        type : Number,
        required : true,
     },
     tax : {
        type : Number,
        required : true,
     },
     shippingCharges : {
        type : Number,
        required : true,
        default : 0
     },
     discount : {
        type : Number,
        required : true,
        default : 0
     },
     total : {
        type : Number,
        required : true,
     },
     status : {
        type : String,
        enum : ["Processing","Shipped","Delivered"],
        default : "Processing"
     }, 
     orderItems: [{
        name : String,
        photo: String,
        price : Number,
        quantity : Number,
        productId : {
            type: mongoose.Types.ObjectId,
            ref: "Product"
        }
     }]     
    }, {
    timestamps: true
})

export const Order = mongoose.model<IOrder>("Order", orderSchema)
