import express from "express";
import {createServer} from "node:http";

import {Server} from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server)


const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes); 


app.get("/home" , (req,res)=> {
    return res.json({"hello": "World"})
});


app.post('/api/v1/users/register', async (req, res) => {
    try {
        const { name, username, password } = req.body;
        
        // Ensure proper registration logic here
        const user = new user({ name, username, password });
        await user.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


const start = async () => {

    app.set("port", PORT);

    const connectionDb = await mongoose.connect("mongodb+srv://raunakjsr0210:abcd1234@raunak.ibujr.mongodb.net/");
    console.log(`MONGO Connected to DB Host: ${connectionDb.connection.host}`)

    server.listen(app.get("port"), ()=> {
        console.log("Listening on port 8000")
    });
}

start();



