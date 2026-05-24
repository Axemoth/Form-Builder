import { db } from "./index";
import { users } from "./schema";

async function main() {
  console.log("=== Inspecting Database Users ===");
  const allUsers = await db.select().from(users);
  console.dir(allUsers, { depth: null });
  console.log("=================================");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
