import express from "express";
import { prismaClient } from "../db";

export const triggerRouter = express.Router();

triggerRouter.get("/available", async (req, res) => {
  const availableTriggers = await prismaClient.availableTriggers.findMany({});

  return res.status(200).json({
    availableTriggers,
  });
});
