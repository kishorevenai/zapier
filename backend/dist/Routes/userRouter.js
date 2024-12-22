"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../Config/middleware");
const Types_1 = require("../Types");
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userRouter = express_1.default.Router();
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
    const parsedData = Types_1.SignupData.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect input format",
        });
    }
    const userExists = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
        },
    });
    if (userExists)
        return res
            .status(400)
            .json({ message: "User Already exists with this email." });
    const hashedPwd = yield bcrypt_1.default.hash(parsedData.data.password, 10);
    yield db_1.prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: hashedPwd,
            name: parsedData.data.name,
        },
    });
    // await sendEmail()
    return res.json({
        message: "Please verify your account by checking your email.",
    });
}));
//@ts-ignore
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = Types_1.SigninData.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        });
    }
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
        },
    });
    const match = yield bcrypt_1.default.compare(parsedData.data.password, user === null || user === void 0 ? void 0 : user.password);
    console.log(user === null || user === void 0 ? void 0 : user.password, parsedData.data.password);
    if (!match) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const accessToken = jsonwebtoken_1.default.sign({
        username: user === null || user === void 0 ? void 0 : user.name,
        id: user === null || user === void 0 ? void 0 : user.id,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({
        id: user === null || user === void 0 ? void 0 : user.id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
        token: accessToken,
    });
}));
//@ts-ignore
exports.userRouter.post("/user", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            id: id,
        },
        select: {
            name: true,
            email: true,
        },
    });
    return res.json({
        user,
    });
}));
