import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/type.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
//const uri = "mongodb+srv://shoaib167:shoaib167@cluster0.qm0or0e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export const connectDB = (uri: string) => {
  mongoose.connect(uri, {
    dbName: "Ecommerce_24",
  })
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidateCache = async ({ product, order, admin, userId, orderId, productId }: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = ["latest-products", "categories", "all-products"];

    if (typeof productId === "string") productKeys.push(`product-${productId}`)
    //array is object
    if (typeof productId === "object") productId.forEach((i) => productKeys.push(`product-${i}`))
    
    myCache.del(productKeys);
  }
  //same as products
  if (order) {

    const orderKeys: string[] = ["all-orders", `my-orders-${userId}`, `order-${orderId}`]
    myCache.del(orderKeys);
  }

  if (admin) {

  }
}

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product)
      throw new Error("Product Not Found");
    product.stock -= order.quantity
    await product.save()
  }
}

export const calculatePercentage = (thisMonth:number,lastMonth:number) =>{ 
  if(lastMonth === 0) return thisMonth*100
  const percent = ((thisMonth - lastMonth)/lastMonth) * 100
  return Number(percent.toFixed(0))
}


