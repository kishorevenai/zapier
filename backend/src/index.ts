require("dotenv").config();
import express from "express";
import { userRouter } from "./Routes/userRouter";
import { zapRouter } from "./Routes/zapRouter";
import { triggerRouter } from "./Routes/triggerRouter";
import { actionRouter } from "./Routes/actionRouter";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);

app.use("/api/v1/zap", zapRouter);

app.use("/api/v1/trigger", triggerRouter);

app.use("/api/v1/action", actionRouter);

app.listen(3001, () => {
  console.log("The server running on port 3001");
});
