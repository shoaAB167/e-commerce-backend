import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/type.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
const uri = "mongodb+srv://shoaib167:shoaib167@cluster0.qm0or0e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export const connectDB = () => {
  mongoose.connect(uri, {
    dbName: "Ecommerce_24",
  })
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidateCache = async({ product, order, admin }: InvalidateCacheProps) => {
  if (product) {

    const productKeys: string[] = ["latest-products", "categories", "all-products"];
    const products = await Product.find({}).select("_id")
    
    products.forEach(i => {
      productKeys.push(`product-${i._id}`)
    });

    myCache.del(productKeys);
  }
  //same as products
  if(order) {

  }
  if(admin) {

  }
}


