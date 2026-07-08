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
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
 
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW())
      
      `);

    await pool.query(`
   CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    type VARCHAR(30) CHECK (type IN ('bug', 'maintainer')),
    status VARCHAR(25) DEFAULT 'open' CHECK (status IN('open', 'in_progress', 'resolved')),
    reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW())
    `);

    console.log("database connected successfully");
  } catch (error) {
    console.log("Error :", error);
  }
};
