import { NextFunction, Response, Request } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/type.js";

export const newUser = async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    try {
        const { name, email, photo, gender, dob, _id } = req.body;
        console.log("body =>",req.body)
        //dob coming as a string in json data but our type is date
        const user = await User.create({name, email, photo, gender, dob : new Date(dob), _id})
         console.log("user =>",user)
        return res.status(201).json({
            success: true,
            message: `Welcome ${user.name}`,
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error,
        })
    }
}