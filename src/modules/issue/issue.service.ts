import { pool } from "../../db";
import type { Iissue } from "./issue.interface";

const createIssueFromDB = async (payLoad: Iissue) => {
  const { title, description, type, status, reporter_id } = payLoad;

  const issue = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id],
  );
  // console.log("Issue", issue);
  if (issue.rows.length === 0) {
    throw new Error("Issue not exists!");
  }

  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, status,reporter_id)
        VALUES($1,$2,$3,$4,$5)
        RETURNING *
    `,
    [title, description, type, status, reporter_id],
  );
  // console.log(result);
  return result;
};

const getAllIssueFromDB = async () => {
  // const { type, status, reporter_id } = payLoad;
  const result = await pool.query(
    `
 SELECT
    i.id,
    i.title,
    i.description,
    i.type,
    i.status,
    json_build_object(
        'id', u.id,
        'name', u.name,
        'role', u.role
    ) AS reporter,
    i.created_at,
    i.updated_at
FROM issues i
JOIN users u
    ON u.id = i.reporter_id;
  `,
  );
  return result;
};
const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1  
        `,
    [id],
  );
  return result;
};

const updateIssueFromDB = async (payLoad: Iissue, id: string) => {
  const { title, description, type, status } = payLoad;
  const result = await pool.query(
    `
   WITH updated_issue AS (
    UPDATE issues
    SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status)
    WHERE id = $5
    RETURNING *
)
SELECT
    i.id,
    i.title,
    i.description,
    i.type,
    i.status,
    json_build_object(
        'id', u.id,
        'name', u.name,
        'role', u.role
    ) AS reporter,
    i.created_at,
    i.updated_at
FROM updated_issue i
JOIN users u
    ON u.id = i.reporter_id;
      
    `,
    [title, description, type, status, id],
  );
  return result;
};

// UPDATE issues
//     SET
//     title=COALESCE($1,title),
//     description=COALESCE($2,description),
//     type=COALESCE($3,type),
//     status=COALESCE($4,status)

//     WHERE id=$5 RETURNING *

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1  
      `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueFromDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB,
};
