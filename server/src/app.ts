import cors from "cors";
import express from "express";

import { AppError } from "./lib/validation";
import { workflowRouter } from "./routes/workflow";

function isAllowedOrigin(origin: string) {
  const configuredOrigin = process.env.CLIENT_ORIGIN;

  if (configuredOrigin && origin === configuredOrigin) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

interface CreateAppOptions {
  apiBasePath?: string;
}

export function createApp({ apiBasePath = "/api" }: CreateAppOptions = {}) {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new AppError("Origin is not allowed.", 403));
      },
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.use(apiBasePath, workflowRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    if (error instanceof Error) {
      console.error(error);
      res.status(500).json({ message: error.message || "Internal server error." });
      return;
    }

    res.status(500).json({ message: "Internal server error." });
  });

  return app;
}
