import { formatDate } from '@/lib/format';

/**
 * Vertical timeline used for the recognition history, department milestones,
 * and a colleague's project history.
 *
 * @param {{
 *  items: Array<{
 *    id: string, date: string, title: string, description?: string,
 *    tone?: 'primary'|'gold', meta?: import('react').ReactNode,
 *    dateLabel?: string,
 *  }>,
 * }} props
 */
export function Timeline({ items = [] }) {
  if (!items.length) return null;

  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.id} className={`timeline__item ${item.tone === 'gold' ? 'timeline__item--gold' : ''}`.trim()}>
          {/* `dateLabel` bypasses formatting entirely - used for a range
              ("Mar 2024 - Present") that `formatDate` can't produce from a
              single date. */}
          <span className="timeline__date">{item.dateLabel ?? formatDate(item.date, 'short')}</span>
          <h3 className="timeline__title">{item.title}</h3>
          {item.description ? <p className="timeline__text">{item.description}</p> : null}
          {item.meta ?? null}
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
