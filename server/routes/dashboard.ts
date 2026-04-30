import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getDashboardSummary } from "../controllers/dashboardController";

const router = Router();
router.use(requireAuth);
router.get("/summary", getDashboardSummary);
export default router;
