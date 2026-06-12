import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { pool } from "../../db";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", userController.createUser);
router.get("/", auth(), userController.displayAllUser);
router.get("/:id", userController.displaySingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const userRoute = router;
