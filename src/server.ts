import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import { config } from "./config";

const app: Application = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: config.database_url,
});

const initDB = async () => {
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
    console.log("database connected");
  } catch (error) {
    console.log(error);
  }
};
initDB();
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Installed Successfully",
    author: "Test@test.com",
  });
});
app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const result = await pool.query(
      `
        INSERT INTO users(name, email, password, role)
        VALUES($1,$2,$3,$4)
        RETURNING *
    `,
      [name, email, password, role],
    );
    // console.log(result);
    res.status(201).json({
      success: true,
      message: "Created Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
    SELECT * FROM users
    `);
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
});

app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const result = await pool.query(
      `
    SELECT * FROM users WHERE id=$1
    `,
      [id],
    );
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
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const result = await pool.query(
      `
    DELETE FROM users WHERE id=$1
    `,
      [id],
    );

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
});

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, role } = req.body;
  // console.log(id);
  try {
    const result = await pool.query(
      ` UPDATE users SET 
      name=COALESCE($1,name),
      password=COALESCE($2,password),
      role=COALESCE($3,role)

      WHERE id=$4 RETURNING *
    `,
      [name, password, role, id],
    );
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
});

export default app;
