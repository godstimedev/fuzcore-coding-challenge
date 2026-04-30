import type { Express } from "express";
import type { Server } from "http";
import authRouter from "./auth";
import customersRouter from "./customers";
import categoriesRouter from "./categories";
import transactionsRouter from "./transactions";
import invoicesRouter from "./invoices";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";

export async function registerRoutes(httpServer: Server, app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/transactions", transactionsRouter);
  app.use("/api/invoices", invoicesRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/ai", aiRouter);
}
