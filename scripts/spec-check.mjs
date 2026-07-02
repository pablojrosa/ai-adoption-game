import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const requiredFiles = [
  "specs/README.md",
  "specs/templates/feature-spec.md",
  "specs/active/README.md",
  "specs/done/README.md",
];

const requiredHeadings = [
  "# ",
  "## Status",
  "## Summary",
  "## Problem",
  "## Scope",
  "## Changed Files",
  "## Requirements",
  "## Acceptance Criteria",
  "## Implementation Notes",
  "## Decisions",
  "## Discoveries During Implementation",
  "## Test Plan",
  "## Validation",
  "## Risks / Open Questions",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required scaffold file: ${file}`);
    process.exit(1);
  }
}

const activeDir = "specs/active";
const activeSpecs = [];

for (const entry of readdirSync(activeDir)) {
  const file = join(activeDir, entry);
  if (!entry.endsWith(".md") || entry === "README.md" || !statSync(file).isFile()) {
    continue;
  }
  activeSpecs.push(file);
}

for (const file of activeSpecs) {
  const content = readFileSync(file, "utf8");

  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) {
      console.error(`Spec is missing heading "${heading}" in ${file}`);
      process.exit(1);
    }
  }

  const requiredStatusFields = [
    "- State:",
    "- Owner:",
    "- Last updated:",
  ];

  for (const field of requiredStatusFields) {
    if (!content.includes(field)) {
      console.error(`Spec is missing status field "${field}" in ${file}`);
      process.exit(1);
    }
  }
}

console.log(`Spec scaffold OK (${activeSpecs.length} active spec${activeSpecs.length === 1 ? "" : "s"}).`);
