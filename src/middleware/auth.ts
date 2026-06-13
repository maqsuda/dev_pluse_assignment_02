import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Roles :", roles);
    try {
      console.log(req.headers.authorization);
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!!",
        });
      }

      const decode = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userDate = await pool.query(`SELECT * FROM users WHERE email=$1 `, [
        decode.email,
      ]);
      // console.log(userDate);
      const user = userDate.rows[0];
      // console.log(user);

      if (userDate.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User Not Found!!",
        });
      }

      // if (!user.is_active) {
      //   res.status(403).json({
      //     success: false,
      //     message: "Forbidden!!",
      //   });
      // }

      // console.log("Auth :", user.role);
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden!! user role",
        });
      }

      req.user = decode;

      next();
    } catch (error) {
      next(error);
    }
  };
};
export default auth;
