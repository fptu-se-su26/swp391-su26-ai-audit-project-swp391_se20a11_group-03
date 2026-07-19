const fs = require("fs");
const p = process.argv[2];
const s = fs.readFileSync(p, "utf8");
let depth = 0;
let inStr = false;
let esc = false;
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === "\\") esc = true;
    else if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') {
    inStr = true;
    continue;
  }
  if (c === "{") depth++;
  if (c === "}") depth--;
  if (depth === 0 && i > 0 && c === "}") {
    const line = s.slice(0, i).split("\n").length;
    console.log("Root closed at index", i, "line", line);
    console.log("Next chars:", JSON.stringify(s.slice(i + 1, i + 120)));
    break;
  }
}
