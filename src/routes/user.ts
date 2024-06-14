import express from "express";
import { newUser } from "../controllers/user.js";

const app = express.Router();

///api/v1/user/new
//If there are multiple function in post function then if we call next in function with no first parameter as error then it will call next available function 
app.post("/new", newUser)

export default app;