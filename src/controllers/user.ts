import { NextFunction, Response, Request } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/type.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    const { name, email, photo, gender, dob, _id } = req.body;
    //dob coming as a string in json data but our type is date
    const user = await User.create({ name, email, photo, gender, dob: new Date(dob), _id })
    console.log("user =>", user)
    return res.status(201).json({
        success: true,
        message: `Welcome ${user.name}`,
    })
})