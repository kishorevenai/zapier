import express from "express";
import { prismaClient } from "../db";

export const actionRouter = express.Router();

actionRouter.get("/available", async (req, res) => {
  const availableActions = await prismaClient.availableAction.findMany({});

  return res.status(200).json({
    availableActions,
  });
});
