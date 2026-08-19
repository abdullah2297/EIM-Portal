import { formatDate } from '@/lib/format';

/**
 * Vertical timeline used for the recognition history and department milestones.
 *
 * @param {{
 *  items: Array<{ id: string, date: string, title: string, description?: string, tone?: 'primary'|'gold', meta?: import('react').ReactNode }>,
 * }} props
 */
export function Timeline({ items = [] }) {
  if (!items.length) return null;

  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.id} className={`timeline__item ${item.tone === 'gold' ? 'timeline__item--gold' : ''}`.trim()}>
          <span className="timeline__date">{formatDate(item.date, 'short')}</span>
          <h3 className="timeline__title">{item.title}</h3>
          {item.description ? <p className="timeline__text">{item.description}</p> : null}
          {item.meta ?? null}
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
