

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/config/index.ts
import { env } from "process";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
var config = {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  secret: env.JWT_SECRET,
  refresh_secret: env.JWT_REFRESH_SECRET
};

// src/app.ts
import express from "express";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config.database_url
});
var initDB = async () => {
  try {
    await pool.query(`
       CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(30),
      email VARCHAR(20) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
 
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW())
      
      `);
    await pool.query(`
   CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('bug', 'maintainer')),
    status VARCHAR(15) DEFAULT 'open' CHECK (status IN('open', 'in_progress', 'resolved')),
    reporter_id INT UNIQUE UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW())
    `);
    console.log("database connected successfully");
  } catch (error) {
    console.log("Error :", error);
  }
};

// src/modules/user/user.route.ts
import {
  Router
} from "express";

// src/modules/user/user.service.ts
import "bcryptjs";
var displayAllUserToDB = async () => {
  const result = await pool.query(`
    SELECT * FROM users
    `);
  return result;
};
var displaySingleUserToDB = async (id) => {
  const result = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [id]
  );
  return result;
};
var updateUserToDB = async (payLoad, id) => {
  const { name, password, role } = payLoad;
  const result = await pool.query(
    ` UPDATE users SET 
      name=COALESCE($1,name),
      password=COALESCE($2,password),
      role=COALESCE($3,role)

      WHERE id=$4 RETURNING *
    `,
    [name, password, role, id]
  );
  return result;
};
var deleteUserToDB = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM users WHERE id=$1
    `,
    [id]
  );
  return result;
};
var userService = {
  displayAllUserToDB,
  displaySingleUserToDB,
  updateUserToDB,
  deleteUserToDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var displayAllUser = async (req, res) => {
  console.log("controller :", req.user);
  try {
    const result = await userService.displayAllUserToDB();
    res.status(200).json({
      success: true,
      message: "Data retrive successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var displaySingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.displaySingleUserToDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found.",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Data retrive successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserToDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found.",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Data Updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserToDB(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found.",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Data delete successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  displayAllUser,
  displaySingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!!"
        });
      }
      const decode = jwt.verify(
        token,
        config.secret
      );
      const userDate = await pool.query(`SELECT * FROM users WHERE email=$1 `, [
        decode.email
      ]);
      const user = userDate.rows[0];
      if (userDate.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User Not Found!!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden!! user role"
        });
      }
      req.user = decode;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/user/user.route.ts
var router = Router();
router.get(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  userController.displayAllUser
);
router.get("/:id", userController.displaySingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserToDB = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email
  ]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!!");
  }
  const jwtPaylod = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accesToken = jwt2.sign(jwtPaylod, config.secret, {
    expiresIn: "1d"
  });
  const refreshToken2 = jwt2.sign(jwtPaylod, config.refresh_secret, {
    expiresIn: "10d"
  });
  return { token: { accesToken, refreshToken: refreshToken2 }, user: jwtPaylod };
};
var createUserToDB = async (payLoad) => {
  const { name, email, password, role } = payLoad;
  const hashPassword = await bcrypt2.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role)
        VALUES($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized");
  }
  console.log("Token :", token);
  const decoded = jwt2.verify(
    token,
    config.refresh_secret
  );
  const userData = await pool.query(
    `
     SELECT * FROM users WHERE email=$1   
        `,
    [decoded.email]
  );
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found!!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtpayload, config.secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  loginUserToDB,
  createUserToDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserToDB(req.body);
    const refreshToken2 = result;
    const accessToken = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      //in production ->true
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserToDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken
    );
    res.status(200).json({
      success: true,
      message: "Acess token generated!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken,
  createUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authController.loginUser);
router2.post("/signup", auth_default(USER_ROLE.contributor), authController.createUser);
router2.post("/refresh-token", authController.refreshToken);
var authRoute = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method} - URL -> ${req.url} - Time -> ${Date.now()}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import CookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/issue/issue.route.ts
import { Router as Router3 } from "express";

// src/modules/issue/issue.service.ts
var createIssueFromDB = async (payLoad) => {
  const { title, description, type, status, reporter_id } = payLoad;
  const issue = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id]
  );
  if (issue.rows.length === 0) {
    throw new Error("Issue not exists!");
  }
  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, status,reporter_id)
        VALUES($1,$2,$3,$4,$5)
        RETURNING *
    `,
    [title, description, type, status, reporter_id]
  );
  console.log(result);
  return result;
};
var getAllIssueFromDB = async () => {
  const result = await pool.query(
    `
    SELECT * FROM issues 
     ORDER BY created_at ASC;
  `
  );
  return result;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1  
        `,
    [id]
  );
  return result;
};
var updateIssueFromDB = async (payLoad, id) => {
  const { title, description, type, status } = payLoad;
  const result = await pool.query(
    `
    UPDATE issues 
    SET 
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status)
    
    WHERE id=$5 RETURNING *
    `,
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1  
      `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueFromDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueFromDB(req.body);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    console.log(req.body);
    const result = await issueService.getAllIssueFromDB();
    res.status(201).json({
      success: true,
      message: "Issues retrived Successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Data Not found!",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrived successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueFromDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue updated successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Issue Not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully!",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.route.ts
var route = Router3();
route.post(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.createIssue
);
route.get("/", issueController.getAllIssues);
route.get("/:id", issueController.getSingleIssue);
route.put("/:id", auth_default(USER_ROLE.maintainer), issueController.updateIssue);
route.delete("/:id", auth_default(USER_ROLE.maintainer), issueController.deleteIssue);
var issueRoute = route;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());
app.use(logger_default);
app.use(
  cors({
    origin: "http://localhost:5000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Operation description",
    data: "Response data"
  });
});
app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  initDB();
  app_default.listen(config.port, () => {
    console.log(`PORT : ${config.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map