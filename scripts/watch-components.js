const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const componentsPath = path.join(__dirname, "../src/elements");
const manifestPath = path.join(__dirname, "../src/utils/elementManifest.ts");

function generateManifest() {
  try {
    if (!fs.existsSync(componentsPath)) {
      console.error("❌ Components directory not found:", componentsPath);
      return;
    }

    const folders = fs
      .readdirSync(componentsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const manifest = folders.map((folder) => {
      const folderPath = path.join(componentsPath, folder);
      const components = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".tsx") && !file.startsWith("index"))
        .map((file) => file.replace(".tsx", ""));

      return {
        name: folder,
        path: `/components/${folder}`,
        components,
      };
    });

    const manifestContent = `// This file is auto-generated. Do not edit manually.
export const COMPONENT_MANIFEST = ${JSON.stringify(manifest, null, 2)};
`;

    fs.writeFileSync(manifestPath, manifestContent);
    console.log("✅ Component manifest updated successfully!");
  } catch (error) {
    console.error("❌ Error generating manifest:", error);
  }
}

// Initialize watcher
const watcher = chokidar.watch(componentsPath, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: false,
  depth: 1,
});

watcher
  .on("add", (path) => {
    console.log(`📁 File ${path} has been added`);
    generateManifest();
  })
  .on("unlink", (path) => {
    console.log(`🗑️ File ${path} has been removed`);
    generateManifest();
  })
  .on("addDir", (path) => {
    console.log(`📁 Directory ${path} has been added`);
    generateManifest();
  })
  .on("unlinkDir", (path) => {
    console.log(`🗑️ Directory ${path} has been removed`);
    generateManifest();
  })
  .on("error", (error) => {
    console.error(`❌ Watcher error: ${error}`);
  })
  .on("ready", () => {
    console.log("👀 Watching for component changes...");
  });

generateManifest();

process.stdin.resume();

process.on("SIGINT", () => {
  watcher.close();
  console.log("\n🛑 Stopping component watcher");
  process.exit(0);
});
