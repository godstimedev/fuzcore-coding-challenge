import type { Express } from "express";
import type { Server } from "http";
import authRouter from "./auth";
import customersRouter from "./customers";

export async function registerRoutes(httpServer: Server, app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/customers", customersRouter);
}
