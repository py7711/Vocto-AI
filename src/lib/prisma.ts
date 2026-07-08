import {PrismaClient} from "@prisma/client";

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};
let prismaClient: PrismaClient | undefined;

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

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    transactionOptions: prismaTransactionOptions
  });
}

function getPrismaClient() {
  const existing = process.env.NODE_ENV === "production" ? prismaClient : globalForPrisma.prisma;
  if (existing) return existing;

  const client = createPrismaClient();
  if (process.env.NODE_ENV === "production") {
    prismaClient = client;
  } else {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  }
});
