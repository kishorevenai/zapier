import express from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();
const app = express();

//https://hooks.zapier.com/hooks/catch/4198498419/4818198

//password logic
app.use(express.json());

//@ts-ignore
app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  console.log("COMING HERE");
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  //store in db a new trigger

  await client.$transaction(async (tx) => {
    const run = await client.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });

    await client.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  return res.json({
    message: "Webhook recieved",
  });

  //push it on to a queue (kafka/redis)
});

app.listen(3002, () => {
  console.log("The server running on port 3002");
});
