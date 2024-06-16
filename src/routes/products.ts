import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

// To create New Products - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct)

// To search/get all products with filter - /api/v1/product/latest
app.get("/all", getAllProducts)

// get latest 5 products - /api/v1/product/latest
app.get("/latest", getLatestProducts)

// To get all categories - /api/v1/product/categories
app.get("/categories", getAllCategories)

// get all products - /api/v1/product/admin-products
app.get("/admin-products", getAdminProducts)

// To get, update, delete product
app.route("/:id").get(getSingleProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct)

export default app;





// params : "/api/v1/user/shfhdgfdh" so if use /api/v1/user/:id then id is params => req.params.id
// query : "/api/v1/user/shfhdgfdh?key=56" => req.query.key 