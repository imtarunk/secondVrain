import { NextFunction, request, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const decoded = jwt.verify(authHeader as string, JWT_SECRET);

  if (decoded) {
    if (typeof decoded === "string") {
      res.status(403).json({
        message: "You are not logged in",
      });
      return;
    }
    req.userId = (decoded as JwtPayload).id;
    next();
  } else {
    res.status(403).json({
      message: "unauthorized user",
    });
  }
};
