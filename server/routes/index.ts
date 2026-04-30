import type { Express } from "express";
import type { Server } from "http";
import authRouter from "./auth";

export async function registerRoutes(httpServer: Server, app: Express) {
  app.use("/api/auth", authRouter);
}
