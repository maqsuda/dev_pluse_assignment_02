import { config } from "./config";
import app from "./app";
import { initDB } from "./db";

const main = async () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`PORT : ${config.port}`);
  });
};

main();
