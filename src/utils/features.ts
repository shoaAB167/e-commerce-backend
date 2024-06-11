import mongoose from "mongoose"

export const connectDB = () => {
 mongoose.connect("",{
    dbName : "Ec0mmerce 24"
 })
}