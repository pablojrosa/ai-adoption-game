import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const name = process.argv.slice(2).join(" ").trim();

if (!name) {
  console.error("Usage: npm run spec:new -- short-feature-name");
  process.exit(1);
}

const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (!slug) {
  console.error("Spec name must contain letters or numbers.");
  process.exit(1);
}

const now = new Date();
const dateStamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("");

const templatePath = "specs/templates/feature-spec.md";
const targetDir = "specs/active";
const targetPath = join(targetDir, `${dateStamp}-${slug}.md`);

if (!existsSync(templatePath)) {
  console.error(`Missing template: ${templatePath}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

if (existsSync(targetPath)) {
  console.error(`Spec already exists: ${targetPath}`);
  process.exit(1);
}

const template = readFileSync(templatePath, "utf8");
const title = name
  .split(/[\s-]+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

writeFileSync(targetPath, template.replace("<Feature Title>", title));
console.log(targetPath);
