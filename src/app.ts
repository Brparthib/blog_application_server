import express, { Application } from "express";
import { router } from "./routes/routes";

const app: Application = express();

app.use(express.json());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Welcome to the Blog Application Sever!");
});

export default app;