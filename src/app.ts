import express, { Response } from "express";

const app = express();

app.get("/", (res: Response) => {
  res.send("Welcome to ReavPages Backend server");
});

if (process.env["PORT"] === undefined) {
  throw new Error("Port Environment Variable is undefined");
}

app.listen(process.env["PORT"], () => {
  console.log(`Server is running at http://localhost:${process.env["PORT"]}`);
});
