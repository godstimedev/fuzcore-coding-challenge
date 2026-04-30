import { Router } from "express";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customersController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { createCustomerSchema, updateCustomerSchema } from "../lib/customerSchemas";

const router = Router();

router.use(requireAuth);

router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post("/", validate(createCustomerSchema), createCustomer);
router.patch("/:id", validate(updateCustomerSchema), updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
