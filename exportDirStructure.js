const fs = require("fs");
const path = require("path");

// Folders to ignore
const ignoreFolders = [".git", "node_modules"];

function exportDirStructure(dir, level = 0) {
  let result = "";
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const isLast = index === files.length - 1;

    if (stats.isDirectory() && ignoreFolders.includes(file)) {
      return; // Skip this directory
    }

    result += `${" ".repeat(level * 2)}${isLast ? "└── " : "├── "}${file}\n`;

    if (stats.isDirectory()) {
      result += exportDirStructure(filePath, level + 1);
    }
  });

  return result;
}

const rootDir = process.argv[2] || ".";
const outputFile = "directory-structure.txt";

const structure = exportDirStructure(rootDir);

fs.writeFileSync(outputFile, structure);

console.log(`Directory structure has been exported to ${outputFile}`);
console.log(`Ignored folders: ${ignoreFolders.join(", ")}`);
