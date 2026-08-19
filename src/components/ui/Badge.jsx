import { Icon } from './Icon';

/**
 * Status / category pill.
 *
 * @param {{
 *  children: import('react').ReactNode,
 *  tone?: 'neutral'|'primary'|'secondary'|'accent'|'gold'|'success'|'warning'|'danger'|'info'|'on-dark'|'outline',
 *  icon?: string,
 *  dot?: boolean,
 *  pulse?: boolean,
 *  className?: string,
 * }} props
 */
export function Badge({ children, tone = 'neutral', icon, dot = false, pulse = false, className = '' }) {
  const classes = [
    'badge',
    `badge--${tone}`,
    dot ? 'badge--dot' : '',
    pulse ? 'badge--pulse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {icon ? <Icon name={icon} fontSize="inherit" /> : null}
      {children}
    </span>
  );
}

/** Maps a domain status onto a badge tone so colours stay consistent. */
export const STATUS_TONE = {
  Active: 'success',
  Upcoming: 'info',
  Completed: 'neutral',
  'In Progress': 'info',
  Planned: 'warning',
  'On Hold': 'danger',
  New: 'info',
  'In Review': 'warning',
  Actioned: 'success',
  Archived: 'neutral',
};

/** @param {{ status: string, pulse?: boolean }} props */
export function StatusBadge({ status, pulse = false }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? 'neutral'} dot pulse={pulse && status === 'Active'}>
      {status}
    </Badge>
  );
}

/** @param {{ items?: string[], max?: number, className?: string }} props */
export function TagList({ items = [], max, className = '' }) {
  const visible = typeof max === 'number' ? items.slice(0, max) : items;
  const hidden = items.length - visible.length;

  if (!items.length) return null;

  return (
    <ul className={`tag-list ${className}`.trim()}>
      {visible.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
      {hidden > 0 ? <li className="tag">+{hidden} more</li> : null}
    </ul>
  );
}

export default Badge;
