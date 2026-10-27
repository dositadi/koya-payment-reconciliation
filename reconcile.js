// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;

const latest = new Map();
const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
for (const line of lines) {
  try {
    const event = JSON.parse(line);
    if (!event.txn_id) {
      continue;
    }
    const current = latest.get(event.txn_id);
    if (!current || event.ts > current.ts) {
      latest.set(event.txn_id, event);
    }
  } catch (error) {
    continue;
  }
}

for (const event of latest.values()) {
  if (event.status === "success") {
    total += event.amount;
    count += 1;
  }
}

console.log("Total: ", total, "Count: ", count)

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
