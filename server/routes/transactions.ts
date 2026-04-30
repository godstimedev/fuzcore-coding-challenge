import { Router } from "express";
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionsController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { createTransactionSchema, updateTransactionSchema } from "../lib/transactionSchemas";

const router = Router();

router.use(requireAuth);

router.get("/", listTransactions);
router.get("/:id", getTransaction);
router.post("/", validate(createTransactionSchema), createTransaction);
router.patch("/:id", validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
