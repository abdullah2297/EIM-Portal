import Link from 'next/link';
import { getInitials } from '@/lib/format';

/**
 * Person / team avatar.
 *
 * No photograph is shipped with the project, so the default rendering is an
 * initials tile - an obvious, deliberate placeholder. Supplying `src` (through
 * the admin panel) switches to the real image automatically.
 *
 * @param {{
 *  name: string,
 *  src?: string | null,
 *  size?: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl',
 *  ring?: boolean,
 *  ringGold?: boolean,
 *  href?: string,
 *  className?: string,
 * }} props
 */
export function Avatar({ name, src, size = 'md', ring = false, ringGold = false, href, className = '' }) {
  const classes = [
    'avatar',
    `avatar--${size}`,
    ring ? 'avatar--ring' : '',
    ringGold ? 'avatar--ring-gold' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = src ? (
    <img src={src} alt={name} loading="lazy" />
  ) : (
    <span aria-hidden="true">{getInitials(name)}</span>
  );

  if (href) {
    return (
      <Link href={href} className={classes} title={name} aria-label={name}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={classes} title={name} role="img" aria-label={name}>
      {inner}
    </span>
  );
}

/**
 * Overlapping avatar row used for contributor lists.
 * @param {{ people: Array<{ id: string, fullName: string, photo?: string|null }>, max?: number, size?: string }} props
 */
export function AvatarStack({ people = [], max = 5, size = 'sm' }) {
  if (!people.length) return null;
  const visible = people.slice(0, max);
  const hidden = people.length - visible.length;

  return (
    <div className="avatar-stack">
      {visible.map((person) => (
        <Avatar key={person.id} name={person.fullName} src={person.photo} size={size} />
      ))}
      {hidden > 0 ? <span className="avatar-stack__more">+{hidden}</span> : null}
    </div>
  );
}

export default Avatar;
