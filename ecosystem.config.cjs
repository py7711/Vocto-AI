const fs = require("node:fs");
const path = require("node:path");

const appDir = __dirname;
const envFile = path.join(appDir, ".env");

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  for (const rawLine of fs.readFileSync(filePath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const index = line.indexOf("=");
    if (index === -1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const sharedEnv = {
  NODE_ENV: "production",
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.local/bin",
  ...loadEnvFile(envFile)
};

module.exports = {
  apps: [
    {
      name: "votxt-web",
      cwd: appDir,
      script: "/usr/bin/pnpm",
      args: "start",
      interpreter: "none",
      env: {
        ...sharedEnv,
        PORT: sharedEnv.PORT || "3091"
      },
      autorestart: true,
      restart_delay: 10_000,
      kill_timeout: 60_000,
      merge_logs: true,
      time: true
    },
    {
      name: "votxt-worker",
      cwd: appDir,
      script: "/usr/bin/pnpm",
      args: "run worker",
      interpreter: "none",
      env: sharedEnv,
      autorestart: true,
      restart_delay: 10_000,
      kill_timeout: 60_000,
      merge_logs: true,
      time: true
    }
  ]
};
