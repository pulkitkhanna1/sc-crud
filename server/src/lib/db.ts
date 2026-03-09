import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __cpiWorkflowPrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__cpiWorkflowPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__cpiWorkflowPrisma__ = prisma;
}
