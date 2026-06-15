import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../../config";
import type { IUser } from "../user/user.interface";

const loginUserToDB = async (payLoad: { email: string; password: string }) => {
  const { email, password } = payLoad;

  const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  // console.log(matchPassword);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!!");
  }
  const jwtPaylod = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accesToken = jwt.sign(jwtPaylod, config.secret as string, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(jwtPaylod, config.refresh_secret as string, {
    expiresIn: "10d",
  });
  return { token: { accesToken, refreshToken }, user: jwtPaylod };
};

const createUserToDB = async (payLoad: IUser) => {
  const { name, email, password, role } = payLoad;

  const hashPassword = await bcrypt.hash(password, 10);
  // console.log(hashPassword);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role)
        VALUES($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized");
  }
  console.log("Token :", token);
  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
  ) as JwtPayload;

  const userData = await pool.query(
    `
     SELECT * FROM users WHERE email=$1   
        `,
    [decoded.email],
  );

  const user = userData.rows[0];

  if (userData.rows.length === 0) {
    throw new Error("User not found!!");
  }

  // if (!user?.is_active) {
  //   throw new Error("Forbidden!!");
  // }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });

  return { accessToken };
};

export const authService = {
  loginUserToDB,
  createUserToDB,
  generateRefreshToken,
};
