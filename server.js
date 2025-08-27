import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { router as veterinarianRouter } from "./routes/VeterinarianRoutes.js";
import { router as PatientRoutes } from "./routes/PatientRoutes.js";

// Enable enviroment variables
dotenv.config();

// Create app
const app = express();

// Connect database
connectDB();

// Enable cors to comunicate with other ports
const allowedDomains = ["https://vpa-frontend.netlify.app"];
const corsOptions = {
    origin: function (origin, callback) {
        // Check if origin is allowd
        if (allowedDomains.indexOf(origin) !== -1 || !origin) {
            // null is error that means there is not an error
            // true is to allow acces
            callback(null, true);
            return;
        }

        callback(new Error("No allowed by CORS"));
    },
};
app.use(cors(corsOptions));

// Body parser to read data from forms
app.use(express.urlencoded({ extended: true }));

// Enable to read info from API
app.use(express.json());

// Routes
app.use("/api/veterinarian", veterinarianRouter);
app.use("/api/patient", PatientRoutes);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log("server running on http://localhost:3000");
});
