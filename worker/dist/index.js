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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const parser_1 = require("./parser");
const email_1 = require("./email");
// import { parse } from "./parser";
// import { sendEmail } from "./email";
// import { sendSol } from "./solana";
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor-2",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("START");
        const consumer = kafka.consumer({ groupId: "main-worker-2" });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        console.log("START");
        yield consumer.subscribe({ topic: TOPIC_NAME });
        yield consumer.run({
            autoCommit: false,
            eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                // console.log({
                //   partition,
                //   offset: message.offset,
                //   value: message.value?.toString(),
                // });
                if (!((_a = message.value) === null || _a === void 0 ? void 0 : _a.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString());
                console.log("CHECKING THE MESSAGE TYPE", parsedValue);
                const zapRunId = parsedValue.zapRunId;
                const stage = parseInt(parsedValue.stage);
                console.log("TYPES", parsedValue, zapRunId, stage);
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
                    where: {
                        id: zapRunId,
                    },
                    include: {
                        zap: {
                            include: {
                                Action: {
                                    include: {
                                        type: true,
                                    },
                                },
                            },
                        },
                    },
                });
                console.log("=====================CHECKING============================", zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.Action);
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.Action.find((x) => {
                    console.log(x.sortingOrder, stage);
                    return Number(x.sortingOrder) === Number(stage);
                });
                console.log("=====================CHECKING CURRENT ACTION============================", currentAction);
                if (!currentAction) {
                    console.log("Current action not found?");
                    return;
                }
                if (currentAction.type.id === "email") {
                    const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata; // { comment : {email : "harkirat@gmail.com"}}
                    const body = (0, parser_1.parse)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.body, zapRunMetadata); // You just recieved {comment.amount}
                    const to = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.email, zapRunMetadata); // {comment.email}
                    console.log(`Sending out email to ${to} body is ${body}`);
                    yield (0, email_1.sendEmail)(to, body);
                }
                if (currentAction.type.id === "send-sol") {
                    const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata; // { comment : {email : "harkirat@gmail.com"}}
                    const amount = (0, parser_1.parse)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.amount, zapRunMetadata);
                    const address = (0, parser_1.parse)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.address, zapRunMetadata);
                    console.log(`Sending out SOL of ${amount} to address ${address}`);
                    // await sendSol(address, amount);
                }
                const lastStage = (((_g = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.Action) === null || _g === void 0 ? void 0 : _g.length) || 1) - 1; // 1
                console.log(lastStage);
                console.log(stage);
                if (lastStage !== stage) {
                    console.log("pushing back to the queue");
                    yield producer.send({
                        topic: TOPIC_NAME,
                        messages: [
                            {
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    zapRunId,
                                }),
                            },
                        ],
                    });
                }
                console.log("processing done");
                //
                yield consumer.commitOffsets([
                    {
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString(), // 5
                    },
                ]);
            }),
        });
    });
}
main();
