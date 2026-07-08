import { Router } from "express";
import { authController } from "./auth.controller";
import { USER_ROLE } from "../../types";
import auth from "../../middleware/auth";

const router = Router();

router.post("/login", authController.loginUser);
router.post("/signup", authController.createUser);
router.post("/refresh-token", authController.refreshToken);

export const authRoute = router;
