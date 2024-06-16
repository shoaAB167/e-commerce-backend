import express from "express";
import { newUser, getAllUsers, getUser, deleteUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

//If there are multiple function in post function then if we call next in function with no first parameter as error then it will call next available function 
// /api/v1/user/new
app.post("/new", newUser)
// /api/v1/user/all
app.get("/all", adminOnly, getAllUsers)
// /api/v1/get/:id ==> dynamic id, app.get("/:id", getUser) , app.delete("/:id",deleteUser)  OR
app.route("/:id").get(getUser).delete(deleteUser)

export default app;





// params : "/api/v1/user/shfhdgfdh" so if use /api/v1/user/:id then id is params => req.params.id
// query : "/api/v1/user/shfhdgfdh?key=56" => req.query.key 