import type { Request, Response } from "express";
import { pool } from "../../db";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendResponse";

const displayAllUser = async (req: Request, res: Response) => {
  // console.log("controller :", req.user);
  try {
    const result = await userService.displayAllUserToDB();
    res.status(200).json({
      success: true,
      message: "Data retrive successfully",
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

const displaySingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  //   console.log(id);
  try {
    const result = await userService.displaySingleUserToDB(id as string);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found.",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Data retrive successfully",
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

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  //   const { name, password, role } = req.body;
  // console.log(id);
  try {
    const result = await userService.updateUserToDB(req.body, id as string);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found.",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "Data Updated successfully",
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

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const result = await userService.deleteUserToDB(id as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found.",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Data delete successfully",
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

export const userController = {
  displayAllUser,
  displaySingleUser,
  updateUser,
  deleteUser,
};
