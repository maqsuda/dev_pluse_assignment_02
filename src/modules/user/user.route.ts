import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { pool } from "../../db";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.get(
  "/",
  auth(USER_ROLE.contributor, USER_ROLE.maintainer),
  userController.displayAllUser,
);
router.get("/:id", userController.displaySingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const userRoute = router;
