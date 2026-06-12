import { Pool } from "pg";
import { config } from "../config";

export const pool = new Pool({
  connectionString: config.database_url,
});

export const initDB = async () => {
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
       CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
     user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 
      bio TEXT ,
      address TEXT,
      phone VARCHAR(20),
      gender VARCHAR(10),

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW())
        `);

    console.log("database connected");
  } catch (error) {
    console.log("Error :", error);
  }
};
