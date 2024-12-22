import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

export const TOPIC_NAME = "zap-events";

const client = new PrismaClient();
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();
  // while (1) {
  //   const pendingRows = await client.zapRunOutbox.findMany({
  //     where: {},
  //     take: 10,
  //   });

  //   producer.send({
  //     topic: TOPIC_NAME,
  //     messages: pendingRows.map((r) => ({
  //       value: r.zapRunId,
  //     })),
  //   });

  //   await client.zapRunOutbox.deleteMany({
  //     where: {
  //       id: {
  //         in: pendingRows.map((r) => r.zapRunId),
  //       },
  //     },
  //   });
  // }

  setInterval(async () => {
    console.log("START");
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });
    console.log("CAME HERE ONE");
    console.log("PENDING ROWS", pendingRows);
    console.log("CAME HERE TWO");

    producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => ({
        value: JSON.stringify({
          zapRunId: r.zapRunId,
          stage: 0,


        }),
      })),
    });

    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((r) => r.id),
        },
      },
    });
    console.log("END");
  }, 1000);
}

main();
