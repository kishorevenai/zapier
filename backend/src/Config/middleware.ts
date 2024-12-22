import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    (req.headers.authorization as string) ||
    (req.headers.Authorization as string);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  const token = authHeader.split(" ")[1];

  //@ts-ignore
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    //@ts-ignore
    req.id = decoded.id;
    next();
  });
};
