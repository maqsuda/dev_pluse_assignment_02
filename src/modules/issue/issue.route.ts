import { Router } from "express";
import { pool } from "../../db";
import { issueController } from "./issue.controller";

const route = Router();

route.post("/", issueController.createIssue);
route.get("/", issueController.getAllIssues);
route.get("/:id", issueController.getSingleIssue);
route.put("/:id", issueController.updateIssue);
route.delete("/:id", issueController.deleteIssue);

export const issueRoute = route;
