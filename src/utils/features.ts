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

export const invalidateCache = ({ product, order, admin, userId, orderId, productId }: InvalidateCacheProps) => {
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
     myCache.del(["admin-stats","admin-pie-charts","admin-bar-charts","admin-line-charts"])
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

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100
  //relative percentage
  // const percent = ((thisMonth - lastMonth) / lastMonth) * 100
  //absolute percentage
  const percent = (thisMonth - lastMonth) * 100
  return Number(percent.toFixed(0))
}

export const getInventories = async ({ categories, productsCount }: { categories: string[], productsCount: number }) => {
  const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }))

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round(categoriesCount[i] / productsCount * 100),
    })
  })
  return categoryCount
}

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type FuncProps = {
  length: number,
  today: Date
  docArr: MyDocument[],
  property?: "discount" | "total"
}

export const getChartData = ({ length, today, docArr, property }: FuncProps) => {
  const data: number[] = new Array(length).fill(0)

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12
    if (monthDiff < length) {
      data[length - monthDiff - 1] += property ? i[property]! : 1;
    }
  })
  return data;
}