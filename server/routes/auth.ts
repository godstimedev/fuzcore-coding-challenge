import { Router } from "express";
import { signup, login, logout, me } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { signupBodySchema, loginBodySchema } from "../lib/authSchemas";

const router = Router();

router.post("/signup", validate(signupBodySchema), signup);
router.post("/login", validate(loginBodySchema), login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

export default router;
