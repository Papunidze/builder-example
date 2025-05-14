const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const archiver = require("archiver");
const os = require("os");

const CWD = process.cwd();
const SRC_ELEMENTS_PATH = path.join(CWD, "src", "elements");
const SRC_STYLES_PATH = path.join(CWD, "src", "styles"); // For global styles, variables etc.
const SRC_INTERFACES_PATH = path.join(CWD, "src", "interfaces"); // Path for interfaces

// Function to generate package.json for the temp project
function generatePackageJson(tempDirPath) {
  const packageJson = {
    name: "downloaded-layout",
    private: true,
    version: "0.0.1",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build", // Assuming TypeScript
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.2.0", // Use versions compatible with your project
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      "@types/react": "^18.0.27",
      "@types/react-dom": "^18.0.10",
      "@vitejs/plugin-react": "^4.0.0", // Check for latest stable version
      typescript: "^5.0.0", // Check for latest stable version
      vite: "^4.5.0", // Check for latest stable version
      sass: "^1.60.0", // For SCSS compilation
      // Add other common dev dependencies if your elements need them
    },
  };
  fs.writeFileSync(
    path.join(tempDirPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

// Function to generate vite.config.js
function generateViteConfig(tempDirPath) {
  const viteConfigContent = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Resolve aliases if your elements use them, e.g., for src/utils
  // resolve: {
  //   alias: {
  //     '@components': path.resolve(__dirname, './src/elements'),
  //     '@utils': path.resolve(__dirname, './src/utils'), // if you copy utils
  //   },
  // },
  css: {
    preprocessorOptions: {
      scss: {
        // Example: Inject SCSS variables globally if needed
        // additionalData: \`@import "./src/styles/_variables.scss";\`,
      },
    },
    modules: {
      localsConvention: 'camelCaseOnly', // Or 'camelCase', 'dashes' depending on your main project
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Ensure base is relative for the downloaded package to work from any path
  base: './',
});
`;
  fs.writeFileSync(path.join(tempDirPath, "vite.config.js"), viteConfigContent);
}

// Function to generate tsconfig.json
function generateTsConfig(tempDirPath) {
  const tsconfigContent = `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@interfaces/*": ["./src/interfaces/*"]
    }
  },
  "include": ["src", "vite.config.js"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  const tsconfigNodeContent = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.js"]
}`;
  fs.writeFileSync(path.join(tempDirPath, "tsconfig.json"), tsconfigContent);
  fs.writeFileSync(
    path.join(tempDirPath, "tsconfig.node.json"),
    tsconfigNodeContent
  );
}

// Function to generate index.html
function generateIndexHtml(tempDirPath) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Downloaded Layout</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  fs.ensureDirSync(path.join(tempDirPath, "public")); // Vite might need public dir
  fs.writeFileSync(path.join(tempDirPath, "index.html"), htmlContent);
  // You might copy a vite.svg or other public assets here if needed
  const viteSvg = '<svg xmlns="http://www.w3.org/2000/svg"/>'; // Placeholder
  fs.writeFileSync(path.join(tempDirPath, "public", "vite.svg"), viteSvg);
}

// Function to generate src/main.tsx
function generateMainTsx(tempDirPath) {
  const mainTsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// If you have global CSS to apply, import it here, e.g.:
import "./styles/styles.css"; // Make sure this file is copied

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  fs.ensureDirSync(path.join(tempDirPath, "src"));
  fs.writeFileSync(path.join(tempDirPath, "src", "main.tsx"), mainTsxContent);
}

// Function to generate src/App.tsx which renders the layout
function generateAppTsx(tempDirPath, elementsData) {
  const elementsDataString = JSON.stringify(elementsData)
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/`/g, "\\`") // Escape backticks
    .replace(/\$\{/g, "\\${"); // Escape ${ sequence for template literals

  // This is the START of the appTsxContent template literal
  const appTsxContent = `
import React, { Suspense, lazy, CSSProperties } from 'react';

interface ElementInstance {
  id: string;
  type: string;
  styles: CSSProperties;
  jsSettings?: { [key: string]: any };
}

const elementsData: ElementInstance[] = JSON.parse('${elementsDataString}');

const elementComponentMap: { [key: string]: React.LazyExoticComponent<any> } = {};

elementsData.forEach((elConfig: ElementInstance) => {
  if (typeof elConfig.type === 'string' && elConfig.type.match(/^[a-zA-Z0-9_-]+$/)) {
    // The import() path uses its own backticks. These are correctly part of the generated JS string.
    elementComponentMap[elConfig.type] = lazy(() => import(\`./elements/\${elConfig.type}/index.tsx\`));
  } else {
    console.error('Invalid element type for dynamic import: ' + elConfig.type);
  }
});

const mainContentStyles: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  margin: '0 auto',
  maxWidth: '1200px',
};

function App() {
  if (!Array.isArray(elementsData)) {
    console.error("Elements data is not an array:", elementsData);
    return <div>Error: Invalid elements data format.</div>;
  }

  return (
    <main style={mainContentStyles}>
      {elementsData.map((element: ElementInstance) => {
        if (!element || !element.type || !element.id) {
          console.error("Invalid element structure:", element);
          return <div key={Date.now() + Math.random()} style={{color: 'red'}}>Invalid element data</div>;
        }
        const Component = elementComponentMap[element.type];
        if (!Component) {
          return (
            <div key={element.id} style={{ color: 'red' }}>
              Error: Component type '\${element.type}' not found or not in map.
            </div>
          );
        }
        return (
          <div key={element.id} style={element.styles as CSSProperties}>
            <Suspense fallback={<div>Loading \${element.type}...</div>}>
              <Component {...(element.jsSettings || {})} />
            </Suspense>
          </div>
        );
      })}
    </main>
  );
}

export default App;
`; // This is the END of the appTsxContent template literal.
  fs.writeFileSync(path.join(tempDirPath, "src", "App.tsx"), appTsxContent);
}

// Function to copy element source files
async function copyElementSources(tempDirPath, elementsData) {
  const tempElementsDir = path.join(tempDirPath, "src", "elements");
  fs.ensureDirSync(tempElementsDir);

  const elementTypes = new Set(elementsData.map((el) => el.type));

  for (const elementType of elementTypes) {
    const sourceElementDir = path.join(SRC_ELEMENTS_PATH, elementType);
    const destElementDir = path.join(tempElementsDir, elementType);
    if (fs.existsSync(sourceElementDir)) {
      try {
        await fs.copy(sourceElementDir, destElementDir);
        console.log("Copied element: " + elementType);
      } catch (err) {
        console.error("Error copying element " + elementType + ": " + err);
      }
    } else {
      console.warn(
        "Source directory for element " +
          elementType +
          " not found: " +
          sourceElementDir
      );
    }
  }
}

// MODIFIED: Function to copy necessary global styles
async function copyGlobalStyles(tempDirPath) {
  const tempStylesDir = path.join(tempDirPath, "src", "styles");
  const sourceStyleFile = path.join(CWD, "src", "styles.css"); // Corrected path to src/styles.css
  const destStyleFile = path.join(tempStylesDir, "styles.css");

  if (fs.existsSync(sourceStyleFile)) {
    try {
      fs.ensureDirSync(tempStylesDir); // Ensure the target directory exists
      console.log(
        "Attempting to copy global style file from: " +
          sourceStyleFile +
          " to " +
          destStyleFile
      );
      await fs.copy(sourceStyleFile, destStyleFile);
      console.log("Copied global style file successfully.");
    } catch (err) {
      console.error("Error copying global style file: " + err);
    }
  } else {
    console.warn(
      "Source style file not found: " + sourceStyleFile + ", skipping."
    );
  }
  // Note: If your SCSS files import from node_modules, those dependencies also need to be in the temp project's package.json
  // or handled by Vite's resolver. This function only copies your src/styles.
}

// New function to copy interface files
async function copyInterfaceFiles(tempDirPath) {
  const tempInterfacesDir = path.join(tempDirPath, "src", "interfaces");
  if (fs.existsSync(SRC_INTERFACES_PATH)) {
    try {
      console.log(
        "Attempting to copy interfaces from: " +
          SRC_INTERFACES_PATH +
          " to " +
          tempInterfacesDir
      );
      await fs.copy(SRC_INTERFACES_PATH, tempInterfacesDir);
      console.log("Copied interfaces directory successfully.");
    } catch (err) {
      console.error("Error copying interfaces directory: " + err);
    }
  } else {
    console.warn(
      "Source interfaces directory not found: " +
        SRC_INTERFACES_PATH +
        ", skipping."
    );
  }
}

// MODIFIED: Function to generate a type definition for CSS Modules
function generateCssModuleTypeDefinition(tempDirPath) {
  const tempSrcDir = path.join(tempDirPath, "src");
  try {
    fs.ensureDirSync(tempSrcDir); // Ensure src directory exists
    const cssModulesDefinitionContent = `// Declaration for CSS Modules (.css, .scss, .sass)\ndeclare module \'*.module.css\' {\n  const classes: { readonly [key: string]: string };\n  export default classes;\n}\n\ndeclare module \'*.module.scss\' {\n  const classes: { readonly [key: string]: string };\n  export default classes;\n}\n\ndeclare module \'*.module.sass\' {\n  const classes: { readonly [key: string]: string };\n  export default classes;\n}\n`;
    const destPath = path.join(tempSrcDir, "custom.d.ts");
    fs.writeFileSync(destPath, cssModulesDefinitionContent);
    console.log("Generated CSS Modules type definition at: " + destPath);
  } catch (err) {
    console.error("Error generating CSS Modules type definition: " + err);
  }
}

async function generateExport(elementsData) {
  if (!Array.isArray(elementsData)) {
    console.error("Elements data must be an array.");
    throw new Error("Elements data must be an array.");
  }

  const tempDir = path.join(os.tmpdir(), "builder-react-export-" + Date.now());
  const outputZipPath = path.join(tempDir, "downloaded-layout.zip");

  try {
    console.log("Creating temporary project in: " + tempDir);
    fs.ensureDirSync(tempDir);

    generatePackageJson(tempDir);
    generateViteConfig(tempDir);
    generateTsConfig(tempDir);
    generateCssModuleTypeDefinition(tempDir);
    generateIndexHtml(tempDir);
    generateMainTsx(tempDir);
    await copyInterfaceFiles(tempDir);
    await copyGlobalStyles(tempDir);
    await copyElementSources(tempDir, elementsData);
    generateAppTsx(tempDir, elementsData);

    console.log("Installing dependencies...");
    execSync("npm install", { cwd: tempDir, stdio: "inherit" });

    console.log("Building project...");
    execSync("npm run build", { cwd: tempDir, stdio: "inherit" });

    const buildPath = path.join(tempDir, "dist");
    if (!fs.existsSync(buildPath)) {
      throw new Error("Build directory (dist) not found after build.");
    }

    console.log("Zipping build output to: " + outputZipPath);
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on("close", () => {
        console.log(
          "Archive created successfully: " + archive.pointer() + " total bytes"
        );
        resolve(outputZipPath);
      });
      archive.on("warning", (err) => {
        if (err.code !== "ENOENT") {
          console.warn("Archiver warning: " + err);
        }
      });
      archive.on("error", (err) => reject(err));
      archive.pipe(output);
      archive.directory(buildPath, ".");
      archive.finalize();
    });
  } catch (error) {
    console.error("Error during export process:", error);
    throw error;
  }
}

module.exports = { generateExport };
