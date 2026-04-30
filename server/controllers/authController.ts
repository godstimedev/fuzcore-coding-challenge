import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../../shared/schema";

function userPublic(user: typeof users.$inferSelect) {
  return { id: user.id, email: user.email, name: user.name };
}

export async function signup(req: Request, res: Response) {
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name?: string;
  };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name })
    .returning();

  req.session.userId = user.id;
  return res.status(201).json(userPublic(user));
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.userId = user.id;
  return res.json(userPublic(user));
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("sid");
    return res.json({ message: "Logged out" });
  });
}

export async function me(req: Request, res: Response) {
  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId!));
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(userPublic(user));
}
