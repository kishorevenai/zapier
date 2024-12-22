"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./Routes/userRouter");
const zapRouter_1 = require("./Routes/zapRouter");
const triggerRouter_1 = require("./Routes/triggerRouter");
const actionRouter_1 = require("./Routes/actionRouter");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", userRouter_1.userRouter);
app.use("/api/v1/zap", zapRouter_1.zapRouter);
app.use("/api/v1/trigger", triggerRouter_1.triggerRouter);
app.use("/api/v1/action", actionRouter_1.actionRouter);
app.listen(3001, () => {
    console.log("The server running on port 3001");
});
