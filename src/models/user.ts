import mongoose from "mongoose";
import validator from 'validator'

//type
interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    //It gets created due to timestamp
    createdAt: Date;
    updatedAt: Date;
    //virtual attribute
    age: number
}
const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "Please enter ID"]
        },
        name: {
            type: String,
            required: [true, "Please enter Name"]
        },
        email: {
            type: String,
            unique: [true, "Email already Exist"],
            required: [true, "Please enter Email"],
            validate: validator.default.isEmail
        },
        photo: {
            type: String,
            required: [true, "Please enter Photo"]
        },
        role: {
            type: String,
            required: true,
            enum: ["admin", "user"],
            default: "user"
        },
        gender: {
            type: String,
            required: [true, "Please enter Gender"],
            enum: ["male", "female"],
        },
        dob: {
            type: Date,
            required: [true, "Please enter Date of birth"]
        }

    }, {
    timestamps: true
})

//to create virtual attribute
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob : Date = this.dob;
    let age : number = today.getFullYear() - dob.getFullYear();

    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
})

export const User = mongoose.model<IUser>("User", userSchema)
