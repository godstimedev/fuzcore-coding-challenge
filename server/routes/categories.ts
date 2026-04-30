import { Router } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoriesController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { createCategorySchema, updateCategorySchema } from "../lib/categorySchemas";

const router = Router();

router.use(requireAuth);

router.get("/", listCategories);
router.post("/", validate(createCategorySchema), createCategory);
router.patch("/:id", validate(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
