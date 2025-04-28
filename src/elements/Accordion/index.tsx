import React, { useState } from "react";

export interface AccordionItemProps {
  title: string;
  content: string;
}

export interface AccordionProps {
  items?: AccordionItemProps[];
  isOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  items = [
    { title: "Section 1", content: "Content for section 1" },
    { title: "Section 2", content: "Content for section 2" },
    { title: "Section 3", content: "Content for section 3" },
  ],
  isOpen = "false",
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {isOpen}
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <div
            className={`accordion-title ${
              activeIndex === index ? "active" : ""
            }`}
            onClick={() => toggleAccordion(index)}
          >
            {item.title}
            <span className="accordion-icon">
              {activeIndex === index ? "−" : "+"}
            </span>
          </div>
          {activeIndex === index && (
            <div className="accordion-content">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
