import { existsSync } from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import express from "express";

import { createApp } from "./app";

dotenv.config();

const app = createApp({ apiBasePath: "/api" });
const port = Number(process.env.PORT ?? 4000);

const clientDist = path.resolve(__dirname, "../../client/dist");

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`CPI workflow API running on http://localhost:${port}`);
});
