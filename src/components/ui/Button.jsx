import Link from 'next/link';
import { Icon } from './Icon';

/**
 * Project button. Renders a `<Link>` when `href` is supplied, otherwise a
 * `<button>`. All styling comes from the `.btn` class family so the component
 * carries no inline styles.
 *
 * @param {{
 *  children?: import('react').ReactNode,
 *  variant?: 'primary'|'secondary'|'accent'|'gold'|'outline'|'ghost'|'danger'|'on-dark',
 *  size?: 'sm'|'md'|'lg',
 *  href?: string,
 *  type?: 'button'|'submit'|'reset',
 *  icon?: string,
 *  iconAfter?: string,
 *  block?: boolean,
 *  loading?: boolean,
 *  disabled?: boolean,
 *  className?: string,
 *  onClick?: (event: any) => void,
 *  ariaLabel?: string,
 *  target?: string,
 * }} props
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  icon,
  iconAfter,
  block = false,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ariaLabel,
  target,
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    size === 'lg' ? 'btn--lg' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {!loading && icon ? <Icon name={icon} /> : null}
      {children ? <span>{children}</span> : null}
      {iconAfter ? <Icon name={iconAfter} /> : null}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : undefined}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}

/**
 * Compact icon-only action.
 * @param {{ icon: string, label: string, href?: string, onClick?: Function, bordered?: boolean, className?: string }} props
 */
export function IconButton({ icon, label, href, onClick, bordered = false, className = '' }) {
  const classes = ['icon-button', bordered ? 'icon-button--bordered' : '', className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label} title={label}>
        <Icon name={icon} />
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} aria-label={label} title={label}>
      <Icon name={icon} />
    </button>
  );
}

export default Button;
