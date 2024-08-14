//Middleware which make sure that only admin can access certain routes
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query
    if (!id)
        next(new ErrorHandler("Please Login First", 401))

    const user = await User.findById(id);
    if (!user)
        next(new ErrorHandler("Invaild Id", 400))
    
    if (user?.role != "admin")
        next(new ErrorHandler("Please login as admin", 401))

    next()    
})

