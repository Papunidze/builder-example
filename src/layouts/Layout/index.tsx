import React, { useState, CSSProperties, Suspense, lazy } from "react";
import styles from "./Layout.module.scss";
import { LeftBar } from "../LeftBar";
import { RightBar } from "../RightBar";
import { v4 as uuidv4 } from "uuid";
import { COMPONENT_MANIFEST } from "../../utils/elementManifest";

interface ElementInstance {
  id: string;
  type: string;
  styles: CSSProperties;
}

const elementComponentMap: { [key: string]: React.LazyExoticComponent<any> } =
  COMPONENT_MANIFEST.reduce((acc, element) => {
    acc[element.name] = lazy(() => import(`../../elements/${element.name}`));
    return acc;
  }, {} as { [key: string]: React.LazyExoticComponent<any> });

export const Layout: React.FC = () => {
  const [addedElements, setAddedElements] = useState<ElementInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );

  const handleAddElement = async (elementType: string) => {
    let defaultStyles: CSSProperties = {};
    try {
      const settingsModule = await import(
        `../../elements/${elementType}/settings.ts`
      );
      defaultStyles = settingsModule.settings.defaultStyles || {};
    } catch (error) {
      console.error(`Error loading settings for ${elementType}:`, error);
    }

    const newInstance: ElementInstance = {
      id: uuidv4(),
      type: elementType,
      styles: defaultStyles,
    };
    setAddedElements((prevElements) => [...prevElements, newInstance]);
  };

  const handleInstanceSelect = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
  };

  const handleStyleChange = (
    instanceId: string,
    newStyles: Partial<CSSProperties>
  ) => {
    setAddedElements((prevElements) =>
      prevElements.map((el) =>
        el.id === instanceId
          ? { ...el, styles: { ...el.styles, ...newStyles } }
          : el
      )
    );
  };

  const selectedElement =
    addedElements.find((el) => el.id === selectedInstanceId) || null;

  return (
    <div className={styles.layoutContainer}>
      <LeftBar onElementAdd={handleAddElement} />
      <main className={styles.mainContent}>
        {addedElements.length === 0 &&
          "Click an element on the left to add it."}
        {addedElements.map((element) => {
          const Component = elementComponentMap[element.type];
          if (!Component) {
            // Handle case where component mapping is missing
            return (
              <div key={element.id} style={{ color: "red" }}>
                Error: Component type '{element.type}' not found.
              </div>
            );
          }
          return (
            <div
              key={element.id}
              onClick={() => handleInstanceSelect(element.id)}
              style={{
                ...element.styles,
                border:
                  selectedInstanceId === element.id
                    ? "2px solid blue"
                    : "1px solid grey",
                cursor: "pointer",
                // Ensure the container div takes up necessary space, adjust if needed
                padding: "5px", // Add some padding around the component
                margin: "5px 0", // Add some margin
              }}
            >
              {/* Render the actual component dynamically */}
              <Suspense fallback={<div>Loading {element.type}...</div>}>
                <Component />{" "}
                {/* Pass necessary props if components expect them */}
              </Suspense>
            </div>
          );
        })}
      </main>

      <RightBar
        selectedElement={selectedElement}
        onStyleChange={handleStyleChange}
      />
    </div>
  );
};
