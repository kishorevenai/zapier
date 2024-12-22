import express from "express";
import { ZapCreateSchema } from "../Types";
import { prismaClient } from "../db";
import { authMiddleware } from "../Config/middleware";

export const zapRouter = express.Router();

//@ts-ignore
zapRouter.post("/", async (req, res) => {
  const body = req.body;
  //@ts-ignore
  const id: string = req?.id;
  console.log("CAME HERE");
  console.log(body);
  const parsedData = ZapCreateSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: parsedData.error,
    });
  }

  const zapId = await prismaClient.$transaction(async (tx) => {
    const zap = await prismaClient.zap.create({
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

    const trigger = await tx.trigger.create({
      data: {
        triggerId: parsedData.data.availableTriggerId,
        zapId: zap.id,
      },
    });

    await tx.zap.update({
      where: {
        id: zap.id,
      },
      data: {
        triggerId: trigger.id,
      },
    });

    return zap.id;
  });

  return res.json({
    zapId,
  });
});

zapRouter.get("/:zapId", async (req, res) => {
  //@ts-ignore
  const id = 1;
  const zapId = req.params.zapId;
  const zaps = await prismaClient.zap.findMany({
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
});
