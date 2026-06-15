import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "./db";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import fs from "fs";
import logger from "./middleware/logger";
import CookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { issueRoute } from "./modules/issue/issue.route";

const app: Application = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());
app.use(logger);

// app.use(
//   cors({
//     origin: "http://localhost:5000",
//   }),
// );

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Installed Successfully",
    author: "Test@test.com",
  });
});

app.use("/api/users", userRoute);
app.use("/api/issue", issueRoute);
app.use("/api/auth", authRoute);

app.use(globalErrorHandler);

export default app;
