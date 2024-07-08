import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/type.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

//used cache here we can use redis as well here
//Revalidate on New,Update,Delete product & New Order
export const getLatestProducts = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    let products;
    if (myCache.has("latest-products")) {
        products = JSON.parse(myCache.get("latest-products") as string)
    }
    else {
        //1:ascending -1: descending
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        //store data into the cache
        myCache.set("latest-products", JSON.stringify(products))
    }
    return res.status(200).json({
        success: true,
        products
    })
})

//Revalidate on New,Update,Delete product & New Order
export const getAllCategories = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    let categories;

    if (myCache.has("categories"))
        categories = JSON.parse(myCache.get("categories") as string)
    else {
        //give us aunique categories
        categories = await Product.distinct("category")
        myCache.set("categories", JSON.stringify(categories))
    }

    return res.status(200).json({
        success: true,
        categories
    })
})

//Revalidate on New,Update,Delete product & New Order
export const getAdminProducts = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    let products;

    if (myCache.has("all-products"))
        products = JSON.parse(myCache.get("all-products") as string)
    else {
        products = await Product.find({});
        myCache.set("all-products", JSON.stringify(products))
    }
    return res.status(200).json({
        success: true,
        products
    })
})

export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    const id = req.params.id;
    if (myCache.has(`product-${id}`))
        product = JSON.parse(myCache.get(`product-${id}`) as string)
    else {
        product = await Product.findById(req.params.id);
        if (!product)
            next(new ErrorHandler("Product Not Found", 404))
        myCache.set(`product${id}`, JSON.stringify(product))
    }
    return res.status(200).json({
        success: true,
        product
    })
})

export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please Add Photo", 400));

    if (!name || !price || !stock || !category) {
        //if photo gets add when fields are empty we have to delete photo manually
        rm(photo.path, () => {
            console.log("Deleted")
        });
        return next(new ErrorHandler("please Enter All Fields", 400))
    }

    await Product.create({
        name, price, stock, category: category.toLowerCase(), photo: photo?.path
    });

    invalidateCache({ product: true, order: true, admin: true })

    return res.status(201).json({
        success: true,
        message: "Product Created Successfully"
    })
})

//fields are optional
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const { name, price, stock, category } = req.body
    const photo = req.file;
    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }

    if (photo) {
        rm(product.photo, () => {
            console.log("Old Photo Deleted")
        });
        product.photo = photo.path
    }

    if (name) product.name = name
    if (price) product.price = price
    if (category) product.category = category
    if (stock) product.stock = stock

    await product.save()

    invalidateCache({ product: true, productId: String(product._id),admin: true })

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    })
})

export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }
    rm(product.photo, () => {
        console.log("Product Photo Deleted")
    });
    await product.deleteOne()

    invalidateCache({ product: true, productId: String(product._id),admin: true })

    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})

export const getAllProducts = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query
    const page = Number(req.query.page) || 1
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);

    const baseQuery: BaseQuery = {}

    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i"
        }
    if (price)
        baseQuery.price = {
            $lte: Number(price)
        }
    if (category)
        baseQuery.category = category
    //we are using two awaits to get product so to optimized it we can use promise.all. It will parallely run.
    // const product = await Product.find(baseQuery)
    //     .sort(sort && { price: sort === "asc" ? 1 : -1 })
    //     .limit(limit)
    //     .skip(skip);
    // const filteredOnlyProduct = await Product.find(baseQuery)

    const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const filteredOnlyProductPromise = Product.find(baseQuery)

    const [products, filteredOnlyProduct] = await Promise.all([productsPromise, filteredOnlyProductPromise])
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
        success: true,
        products,
        totalPage
    })
})