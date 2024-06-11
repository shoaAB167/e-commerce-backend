import mongoose from "mongoose";

const uri = "mongodb+srv://shoaib167:shoaib167@cluster0.qm0or0e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export const connectDB = () => {
  mongoose.connect(uri, {
    dbName: "Ecommerce_24",
  })
  .then((c) => console.log(`DB connected to ${c.connection.host}`))
  .catch((e) => console.log(e));
};


