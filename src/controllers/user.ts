import { NextFunction, Response, Request } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/type.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";

export const newUser = TryCatch(async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    const { name, email, photo, gender, dob, _id } = req.body;
    //find user by id
    let user = await User.findById(_id);
    if (user) {
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`
        })
    }
    //validation
    if (!_id || !name || !email || !photo || !gender || !dob)
        next(new ErrorHandler("Please add all fields", 400))
    //dob coming as a string in json data but our type is date
    user = await User.create({ name, email, photo, gender, dob: new Date(dob), _id })

    //201 created
    return res.status(201).json({
        success: true,
        message: `Welcome ${user.name}`,
    })
})

export const getAllUsers = TryCatch(async (req, res, next) => {
    //to hide field we can use select : User.find({}, '-password')
    // If you want to ensure `dob` is excluded in another way, you could manually remove it from each user object
    const users = await User.find({})
    return res.status(200).json({
        success: true,
        users: users
    })
})

export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id)
    if (!user)
        next(new ErrorHandler("Please add all fields", 400))
    
    return res.status(200).json({
        success: true,
        user: user
    })
})

export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id)
    if (!user)
        next(new ErrorHandler("Invaild Id", 400))

    await User.deleteOne();

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
})
