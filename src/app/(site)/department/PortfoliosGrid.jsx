'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlays';

/**
 * "Main portfolios" cards - clickable, since the description is clamped on
 * the card itself. Opens a modal with the full, untruncated description.
 *
 * @param {{ portfolios: Array<{ name: string, teamCount: number, description: string }> }} props
 */
export function PortfoliosGrid({ portfolios = [] }) {
  const [openItem, setOpenItem] = useState(null);

  return (
    <>
      <div className="grid-auto grid-auto--4">
        {portfolios.map((portfolio, index) => (
          <button
            type="button"
            className={`card card--interactive u-anim-in u-delay-${index + 1}`}
            key={portfolio.name}
            onClick={() => setOpenItem(portfolio)}
          >
            <div className="card__body">
              <Badge tone="accent">{portfolio.teamCount} team(s)</Badge>
              <h3 className="card__title">{portfolio.name}</h3>
              <p className="card__text">{portfolio.description}</p>
            </div>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(openItem)}
        onClose={() => setOpenItem(null)}
        title={openItem?.name ?? ''}
        maxWidth="sm"
        actions={<Button variant="outline" onClick={() => setOpenItem(null)}>Close</Button>}
      >
        {openItem ? (
          <div className="u-stack">
            <Badge tone="accent">{openItem.teamCount} team(s)</Badge>
            <p>{openItem.description}</p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default PortfoliosGrid;
