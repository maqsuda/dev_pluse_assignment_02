import { config } from "./config";
import app from "./server";

const main = async () => {
  app.listen(config.port, () => {
    console.log(`PORT : ${config.port}`);
  });
};

main();
