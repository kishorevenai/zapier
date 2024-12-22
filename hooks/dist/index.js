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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
//https://hooks.zapier.com/hooks/catch/4198498419/4818198
//password logic
app.use(express_1.default.json());
//@ts-ignore
app.post("/hooks/catch/:userId/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("COMING HERE");
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;
    //store in db a new trigger
    yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const run = yield client.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body,
            },
        });
        yield client.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            },
        });
    }));
    return res.json({
        message: "Webhook recieved",
    });
    //push it on to a queue (kafka/redis)
}));
app.listen(3002, () => {
    console.log("The server running on port 3002");
});
