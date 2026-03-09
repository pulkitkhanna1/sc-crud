import dotenv from "dotenv";
import serverless from "serverless-http";

import { createApp } from "../server/src/app";

dotenv.config();

const app = createApp({ apiBasePath: "/" });

export default serverless(app);
