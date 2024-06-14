import express from "express";
import { newUser, getAllUsers, getUser, deleteUser } from "../controllers/user.js";

const app = express.Router();

///api/v1/user/new
//If there are multiple function in post function then if we call next in function with no first parameter as error then it will call next available function 
app.post("/new", newUser)
// /api/v1/user/all
app.get("/all", getAllUsers)
// /api/v1/get/:id ==> dynamic id
// app.get("/:id", getUser)
// app.delete("/:id",deleteUser)  OR
app.route("/:id").get(getUser).delete(deleteUser)

export default app;