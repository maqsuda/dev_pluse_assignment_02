import type { Request, Response } from "express";
import { profileService } from "./profile.services";

const createProfile = async (req: Request, res: Response) => {
  try {
    const result = await profileService.createProfileToDB(req.body);
    // console.log(result);
    res.status(201).json({
      success: true,
      message: "Profile Created Successfully",
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

export const profileController = {
  createProfile,
};
