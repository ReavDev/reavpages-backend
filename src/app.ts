import express, { Response } from "express";
import { initializeDatabase } from "./config/database.config";
import config from "./config/config";

const app = express();

app.get("/", (res: Response) => {
  res.send("Welcome to ReavPages Backend server");
});

initializeDatabase().then(() => {
  app.listen(config.port, () => {
    console.log(`Server is running at http://localhost:${config.port}`);
  });
});
