// ORM to work with mongoDB
import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            // URL connection
            `${process.env.URIConnection}`
            // Options
        );

        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB connected in: ${url}`);
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
};
