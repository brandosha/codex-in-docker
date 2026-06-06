import path from "path";
import { existsSync, mkdirSync } from "fs";

function getRootDir() {
  let currentDir = import.meta.dirname;
  for (let i = 0; i < 5; i++) {
    if (existsSync(path.join(currentDir, "package.json"))) {
      return path.resolve(currentDir);
    }
    currentDir = path.join(currentDir, "..");
  }

  throw new Error("Could not find root directory containing package.json");
}

export const appDir = getRootDir();
export const dataDir = path.join(appDir, "data");


[dataDir].forEach(dir => {
  mkdirSync(dir, { recursive: true });
});