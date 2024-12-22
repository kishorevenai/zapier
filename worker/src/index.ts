require("dotenv").config();

import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";
import { parse } from "./parser";
import { sendEmail } from "./email";
// import { parse } from "./parser";
// import { sendEmail } from "./email";
// import { sendSol } from "./solana";

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor-2",
  brokers: ["localhost:9092"],
});

async function main() {
  console.log("START");
  const consumer = kafka.consumer({ groupId: "main-worker-2" });
  await consumer.connect();
  const producer = kafka.producer();
  await producer.connect();
  console.log("START");

  await consumer.subscribe({ topic: TOPIC_NAME });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      // console.log({
      //   partition,
      //   offset: message.offset,
      //   value: message.value?.toString(),
      // });
      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      console.log("CHECKING THE MESSAGE TYPE", parsedValue);
      const zapRunId = parsedValue.zapRunId;
      const stage = parseInt(parsedValue.stage);

      console.log("TYPES", parsedValue, zapRunId, stage);

      const zapRunDetails = await prismaClient.zapRun.findFirst({
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

      console.log(
        "=====================CHECKING============================",
        zapRunDetails?.zap.Action
      );

      const currentAction = zapRunDetails?.zap.Action.find((x) => {
        console.log(x.sortingOrder, stage);

        return Number(x.sortingOrder) === Number(stage);
      });
      console.log(
        "=====================CHECKING CURRENT ACTION============================",
        currentAction
      );

      if (!currentAction) {
        console.log("Current action not found?");
        return;
      }

      if (currentAction.type.id === "email") {
        const zapRunMetadata = zapRunDetails?.metadata; // { comment : {email : "harkirat@gmail.com"}}
        const body = parse(
          (currentAction.metadata as JsonObject)?.body as string,
          zapRunMetadata
        ); // You just recieved {comment.amount}

        const to = parse(
          (currentAction.metadata as JsonObject)?.email as string,
          zapRunMetadata
        ); // {comment.email}

        console.log(`Sending out email to ${to} body is ${body}`);
        await sendEmail(to, body);
      }

      if (currentAction.type.id === "send-sol") {
        const zapRunMetadata = zapRunDetails?.metadata; // { comment : {email : "harkirat@gmail.com"}}
        const amount = parse(
          (currentAction.metadata as JsonObject)?.amount as string,
          zapRunMetadata
        );
        const address = parse(
          (currentAction.metadata as JsonObject)?.address as string,
          zapRunMetadata
        );
        console.log(`Sending out SOL of ${amount} to address ${address}`);
        // await sendSol(address, amount);
      }

      const lastStage = (zapRunDetails?.zap.Action?.length || 1) - 1; // 1
      console.log(lastStage);
      console.log(stage);
      if (lastStage !== stage) {
        console.log("pushing back to the queue");
        await producer.send({
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
      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(), // 5
        },
      ]);
    },
  });
}

main();
