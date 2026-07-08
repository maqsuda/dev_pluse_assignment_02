import { env } from "process";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ quiet: true });

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const config = {
  port: env.PORT as string,
  database_url: env.DATABASE_URL as string,
  secret: env.JWT_SECRET,
  refresh_secret: env.JWT_REFRESH_SECRET,
};
