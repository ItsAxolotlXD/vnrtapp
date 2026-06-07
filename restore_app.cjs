const { execSync } = require('child_process');
try {
  console.log("Restoring src/App.tsx...");
  execSync('git checkout -- src/App.tsx');
  console.log("Done!");
} catch (e) {
  console.error("Error:", e.message);
}
