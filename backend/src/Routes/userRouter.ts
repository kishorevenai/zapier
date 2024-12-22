import express from "express";
import { authMiddleware } from "../Config/middleware";
import { SigninData, SignupData } from "../Types";
import { prismaClient } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  const body = req.body;
  console.log("BODY", body);
  const parsedData = SignupData.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect input format",
    });
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
    },
  });

  if (userExists)
    return res
      .status(400)
      .json({ message: "User Already exists with this email." });

  const hashedPwd = await bcrypt.hash(parsedData.data.password, 10);

  await prismaClient.user.create({
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
});

//@ts-ignore
userRouter.post("/signin", async (req, res) => {
  const body = req.body;
  const parsedData = SigninData.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
    },
  });

  const match = await bcrypt.compare(
    parsedData.data.password,
    user?.password as string
  );

  console.log(user?.password, parsedData.data.password);

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = jwt.sign(
    {
      username: user?.name,
      id: user?.id,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      id: user?.id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: false,
    secure: false,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    token: accessToken,
  });
});

//@ts-ignore
userRouter.post("/user", authMiddleware, async (req, res) => {
  const id = req.id;
  const user = await prismaClient.user.findFirst({
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
});
