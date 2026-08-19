'use client';

import { useState } from 'react';
import { Icon } from './Icon';

/**
 * Accessible single-open accordion, used for rules, FAQs and long lists.
 *
 * @param {{ items: Array<{ id: string, title: string, content: import('react').ReactNode }>, defaultOpenId?: string }} props
 */
export function Accordion({ items = [], defaultOpenId = null }) {
  const [openId, setOpenId] = useState(defaultOpenId);

  if (!items.length) return null;

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div className="accordion__item" key={item.id}>
            <button
              type="button"
              className="accordion__trigger"
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
              id={`accordion-trigger-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span>{item.title}</span>
              <span className="accordion__chevron">
                <Icon name="ExpandMore" />
              </span>
            </button>
            {isOpen ? (
              <div
                className="accordion__panel"
                id={`accordion-panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-trigger-${item.id}`}
              >
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
