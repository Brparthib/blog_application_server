import express, { Application } from "express";
import { router } from "./routes/routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

const app: Application = express();

app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true,
}));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Welcome to the Blog Application Sever!");
});

export default app;