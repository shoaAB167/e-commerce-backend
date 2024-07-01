import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getInventories } from "../utils/features.js";

export const getDashboardStat = TryCatch(async (req, res, next) => {
    let stats = {};

    if (myCache.has("admin-stats")) stats = JSON.parse(myCache.get("admin-stats") as string)
    else {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const today = new Date();

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }
        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        })

        const latestTransactionPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4)

        const [
            thisMonthProducts,
            lastMonthProducts,
            thisMonthUsers,
            lastMonthUsers,
            thisMonthOrders,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femalUsersCount,
            latestTransaction
        ] = await Promise.all([thisMonthProductsPromise,
            lastMonthProductsPromise,
            thisMonthUsersPromise,
            lastMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: "female" }),
            latestTransactionPromise
        ])

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0)

        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0)

        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
        }
        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0)
        const count = {
            revenue,
            user: usersCount,
            product: productsCount,
            order: allOrders.length
        }

        const orderMonthCounts = new Array(6).fill(0)
        const orderMonthlyRevenue = new Array(6).fill(0)

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = today.getMonth() - creationDate.getMonth()
            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        })

        const categoryCount: Record<string, number>[] = await getInventories({ categories, productsCount })

        const ratio = {
            male: usersCount - femalUsersCount,
            female: femalUsersCount
        }

        const modifiedLatestTransaction = latestTransaction.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }))
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },
            ratio,
            latestTransaction: modifiedLatestTransaction
        }

        myCache.set("admin-stats", JSON.stringify(stats))
    }
    return res.status(200).json({
        success: true,
        stats
    })
})

export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts;
    if (myCache.has("admin-pie-charts"))
        charts = JSON.parse(myCache.get("admin-pie-charts") as string)
    else {
        
        const [processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers
        ] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]),
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" })
        ]);

        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        }

        const productCategories: Record<string, number>[] = await getInventories({ categories, productsCount })
        
        const stockAvailability = {
            inStock: productsCount - outOfStock,
            outOfStock: outOfStock
        }

        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0)
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0)
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0)
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0)
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost
        }

        const usersAgeGroup = {
            teen: allUsers.filter(i => i.age < 20).length,
            adult: allUsers.filter(i => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter(i => i.age >= 40).length
        }

        const adminCustomers = {
            admin: adminUsers,
            customer: customerUsers
        }

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            adminCustomers,
            usersAgeGroup
        }

        myCache.set("admin-pie-charts", JSON.stringify(charts))
    }
    return res.status(200).json({
        success: true,
        charts
    })
})

export const getBarCharts = TryCatch(async (req, res, next) => {

})

export const getLineCharts = TryCatch(async (req, res, next) => {

})