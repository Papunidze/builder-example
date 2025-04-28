#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const toPascalCase = (str) => {
  return str
    .replace(/([-_]\w)/g, (g) => g[1].toLowerCase())
    .replace(/^./, (str) => str.toLowerCase());
};

const argv = yargs(hideBin(process.argv))
  .command(
    "$0 <elementName>",
    "Creates a new element folder and basic files",
    (yargs) => {
      yargs.positional("elementName", {
        describe: "Name of the element to create (e.g., MyButton or my-button)",
        type: "string",
      });
    }
  )
  .demandCommand(1, "You must provide the element name.")
  .help()
  .alias("help", "h").argv;

const elementName = argv.elementName;

if (
  !elementName ||
  typeof elementName !== "string" ||
  elementName.trim() === ""
) {
  console.error("Error: Invalid element name provided.");
  process.exit(1);
}

const elementNamePascal = toPascalCase(elementName);
const elementNameKebab = elementName
  .replace(/([A-Z])/g, (g) => `-${g.toLowerCase()}`)
  .replace(/^-/, "");

console.log(
  `Creating element: ${elementNamePascal} (from input: ${elementName})`
);

const elementsDir = path.resolve(__dirname, "..", "src", "elements");
const elementDir = path.join(elementsDir, elementNamePascal);
const elementIndexFile = path.join(elementDir, "index.tsx");
const elementSettingsFile = path.join(elementDir, "settings.ts");
const elementStylesFile = path.join(
  elementDir,
  `${elementNamePascal}.module.scss`
);

const indexTemplate = `import React from 'react';
import styles from './${elementNameKebab}.module.scss';

export interface ${elementNamePascal}Props {
  message?: string;
}

export const ${elementNamePascal}: React.FC<${elementNamePascal}Props> = ({ message = 'Hello from ${elementNamePascal}' }) => {
  return (
    <div className={styles.${elementNameKebab}}>
      {message}
    </div>
  );
};

export default ${elementNamePascal};
`;

const settingsTemplate = `import type { Settings } from '../../interfaces/settings.interfaces';

const elementSpecificStyles = ['color', 'backgroundColor', 'fontSize'] as const;

export const settings: Settings<typeof elementSpecificStyles> = {
  allowedStyles: elementSpecificStyles,
  defaultStyles: {
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: '1rem',
  }
};

export default settings;
`;

const stylesTemplate = `.${elementNameKebab} {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
`;

try {
  if (fs.existsSync(elementDir)) {
    console.warn(`Warning: Directory already exists: ${elementDir}`);
  } else {
    fs.mkdirSync(elementDir, { recursive: true });
    console.log(`Created directory: ${elementDir}`);
  }

  if (fs.existsSync(elementIndexFile)) {
    console.warn(`Warning: File already exists: ${elementIndexFile}`);
  } else {
    fs.writeFileSync(elementIndexFile, indexTemplate);
    console.log(`Created file: ${elementIndexFile}`);
  }

  if (fs.existsSync(elementSettingsFile)) {
    console.warn(`Warning: File already exists: ${elementSettingsFile}`);
  } else {
    fs.writeFileSync(elementSettingsFile, settingsTemplate);
    console.log(`Created file: ${elementSettingsFile}`);
  }

  if (fs.existsSync(elementStylesFile)) {
    console.warn(`Warning: File already exists: ${elementStylesFile}`);
  } else {
    fs.writeFileSync(elementStylesFile, stylesTemplate);
    console.log(`Created file: ${elementStylesFile}`);
  }

  console.log(`\nElement folder '${elementNamePascal}' created successfully!`);
} catch (error) {
  console.error(`Error creating element: ${error.message}`);
  process.exit(1);
}
