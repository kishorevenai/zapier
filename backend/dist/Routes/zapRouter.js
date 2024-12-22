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
exports.zapRouter = void 0;
const express_1 = __importDefault(require("express"));
const Types_1 = require("../Types");
const db_1 = require("../db");
exports.zapRouter = express_1.default.Router();
//@ts-ignore
exports.zapRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    //@ts-ignore
    const id = req === null || req === void 0 ? void 0 : req.id;
    console.log("CAME HERE");
    console.log(body);
    const parsedData = Types_1.ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: parsedData.error,
        });
    }
    const zapId = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const zap = yield db_1.prismaClient.zap.create({
            data: {
                userId: 1,
                triggerId: "",
                Action: {
                    create: parsedData.data.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                        metadata: x.actionMetadata,
                    })),
                },
            },
        });
        const trigger = yield tx.trigger.create({
            data: {
                triggerId: parsedData.data.availableTriggerId,
                zapId: zap.id,
            },
        });
        yield tx.zap.update({
            where: {
                id: zap.id,
            },
            data: {
                triggerId: trigger.id,
            },
        });
        return zap.id;
    }));
    return res.json({
        zapId,
    });
}));
exports.zapRouter.get("/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = 1;
    const zapId = req.params.zapId;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            // id: zapId,
            userId: id,
        },
        include: {
            Action: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });
    return res.json({
        zaps,
    });
}));
