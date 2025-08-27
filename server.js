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
const allowedOrigins = [
    "https://vpa-frontend.netlify.app", // tu frontend en Netlify
    "http://localhost:5173", // dev local (Vite)
    // agrega tu dominio custom si lo tenés, ej: "https://midominio.com"
];

app.use(
    cors({
        origin(origin, cb) {
            // Permite requests sin origin (Postman/SSR) o los que estén en la lista
            if (!origin || allowedOrigins.includes(origin))
                return cb(null, true);
            return cb(new Error("CORS: Origin no permitido"));
        },
        credentials: true, // si usás cookies o Authorization
    })
);

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
