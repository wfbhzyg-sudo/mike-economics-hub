import { cp, mkdir, writeFile, readFile, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
if (process.platform !== "darwin")
  throw new Error("This installer is for macOS only");
const source = dirname(fileURLToPath(import.meta.url)),
  root = join(homedir(), "Library/Application Support/MikeHomework"),
  destination = join(root, "worker");
const supplied = JSON.parse(await readFile(process.argv[2], "utf8"));
if (!supplied.origin || !supplied.secret)
  throw new Error("Missing device pairing configuration");
await mkdir(destination, { recursive: true, mode: 0o700 });
await chmod(root, 0o700);
for (const f of ["worker.mjs", "package.json", "package-lock.json"])
  await cp(join(source, f), join(destination, f));
execFileSync(
  "/usr/local/bin/npm",
  ["ci", "--omit=dev", "--no-audit", "--no-fund"],
  {
    cwd: destination,
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin",
    },
  },
);
const configPath = join(root, "worker-config.json");
await writeFile(configPath, JSON.stringify(supplied, null, 2), { mode: 0o600 });
await chmod(configPath, 0o600);
const agents = join(homedir(), "Library/LaunchAgents");
await mkdir(agents, { recursive: true });
const escape = (x) =>
  String(x)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
function plist(label, args, env) {
  return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>Label</key><string>${label}</string><key>ProgramArguments</key><array>${args.map((x) => `<string>${escape(x)}</string>`).join("")}</array><key>EnvironmentVariables</key><dict>${Object.entries(
    env,
  )
    .map(([k, v]) => `<key>${k}</key><string>${escape(v)}</string>`)
    .join(
      "",
    )}</dict><key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>30</integer><key>WorkingDirectory</key><string>${escape(root)}</string><key>StandardOutPath</key><string>${escape(join(root, label + ".log"))}</string><key>StandardErrorPath</key><string>${escape(join(root, label + ".error.log"))}</string></dict></plist>`;
}
await writeFile(
  join(agents, "com.mike.homework.ollama.plist"),
  plist("com.mike.homework.ollama", ["/usr/local/bin/ollama", "serve"], {
    OLLAMA_HOST: "127.0.0.1:11434",
    OLLAMA_NO_CLOUD: "1",
    OLLAMA_CONTEXT_LENGTH: "16384",
    OLLAMA_NUM_PARALLEL: "1",
    OLLAMA_KEEP_ALIVE: "10m",
  }),
);
await writeFile(
  join(agents, "com.mike.homework.worker.plist"),
  plist(
    "com.mike.homework.worker",
    ["/usr/local/bin/node", join(destination, "worker.mjs"), configPath],
    { PATH: "/usr/local/bin:/usr/bin:/bin" },
  ),
);
await writeFile(
  join(root, "打开作业工作台.webloc"),
  `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>URL</key><string>${escape(supplied.origin + "/homework/")}</string></dict></plist>`,
);
console.log(
  "Installed private worker files and login services. Start with launchctl bootstrap after the cloud service is ready.",
);
