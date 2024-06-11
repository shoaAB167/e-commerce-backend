import { NextFunction, Response, Request } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/type.js";

export const newUser = async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    try {
        const { name, email, photo, gender, role, dob, _id } = req.body;
        const user = await User.create({name, email, photo, gender, role, dob, _id})

        return res.status(200).json({
            success: true,
            message: `Welcome ${user.name}`,
        })
    } catch (error) {

    }
}