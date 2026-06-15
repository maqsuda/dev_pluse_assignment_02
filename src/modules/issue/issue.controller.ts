import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  console.log("create Issue");
  try {
    const result = await issueService.createIssueFromDB(req.body);
    // console.log(req.body);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    // const body = req.body;
    console.log(req.body);
    const result = await issueService.getAllIssueFromDB();
    res.status(201).json({
      success: true,
      message: "Issues retrived Successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Data Not found!",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue retrived successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.updateIssueFromDB(req.body, id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!",
      });
    }

    // console.log(result);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id as string);
    // console.log(result);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully!",
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
