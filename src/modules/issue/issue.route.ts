import { Router } from "express";
import { pool } from "../../db";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const route = Router();

route.post(
  "/",
  auth(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.createIssue,
);
route.get("/", issueController.getAllIssues);
route.get("/:id", issueController.getSingleIssue);
route.put("/:id", auth(USER_ROLE.maintainer), issueController.updateIssue);
route.delete("/:id", auth(USER_ROLE.maintainer), issueController.deleteIssue);

export const issueRoute = route;
