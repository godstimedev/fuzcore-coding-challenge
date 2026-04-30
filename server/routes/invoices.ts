import { Router } from "express";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from "../controllers/invoicesController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateStatusSchema,
} from "../lib/invoiceSchemas";

const router = Router();

router.use(requireAuth);

router.get("/", listInvoices);
router.get("/:id", getInvoice);
router.post("/", validate(createInvoiceSchema), createInvoice);
router.patch("/:id", validate(updateInvoiceSchema), updateInvoice);
router.patch("/:id/status", validate(updateStatusSchema), updateInvoiceStatus);
router.delete("/:id", deleteInvoice);

export default router;
