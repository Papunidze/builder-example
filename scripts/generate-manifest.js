const fs = require("fs");
const path = require("path");

const componentsPath = path.join(__dirname, "../src/components");
const manifestPath = path.join(__dirname, "../src/utils/componentManifest.ts");

function generateManifest() {
  try {
    console.log("Scanning components directory:", componentsPath);

    if (!fs.existsSync(componentsPath)) {
      console.error("Components directory not found:", componentsPath);
      return;
    }

    const folders = fs
      .readdirSync(componentsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log("Found folders:", folders);

    const manifest = folders.map((folder) => {
      const folderPath = path.join(componentsPath, folder);
      console.log(`Scanning folder: ${folder}`);

      const components = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".tsx") && !file.startsWith("index"))
        .map((file) => file.replace(".tsx", ""));

      console.log(`Found components in ${folder}:`, components);

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
    console.log("Component manifest generated successfully!");
    console.log("Manifest content:", manifest);
  } catch (error) {
    console.error("Error generating manifest:", error);
  }
}

generateManifest();
