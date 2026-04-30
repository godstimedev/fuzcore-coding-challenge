import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { categorizeSchema } from "../lib/aiSchemas";
import { suggestCategory } from "../controllers/aiController";

const router = Router();
router.use(requireAuth);
router.post("/categorize", validate(categorizeSchema), suggestCategory);
export default router;
