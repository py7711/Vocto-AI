import {PrismaClient} from "@prisma/client";

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};

function positiveIntFromEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const prismaTransactionOptions = {
  maxWait: positiveIntFromEnv("PRISMA_TRANSACTION_MAX_WAIT_MS", 10_000),
  timeout: positiveIntFromEnv("PRISMA_TRANSACTION_TIMEOUT_MS", 20_000)
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    transactionOptions: prismaTransactionOptions
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
