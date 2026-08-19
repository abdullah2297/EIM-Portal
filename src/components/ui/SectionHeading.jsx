import { Icon } from './Icon';

/**
 * Consistent section header: eyebrow, title, supporting line and an optional
 * action on the right.
 *
 * @param {{
 *  eyebrow?: string,
 *  eyebrowIcon?: string,
 *  title: string,
 *  subtitle?: string,
 *  action?: import('react').ReactNode,
 *  as?: 'h2'|'h3',
 *  id?: string,
 * }} props
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  action,
  as: Tag = 'h2',
  id,
}) {
  return (
    <header className="section-head">
      <div className="section-head__text">
        {eyebrow ? (
          <span className="section-head__eyebrow">
            {eyebrowIcon ? <Icon name={eyebrowIcon} fontSize="inherit" /> : null}
            {eyebrow}
          </span>
        ) : null}
        <Tag className="section-head__title" id={id}>
          {title}
        </Tag>
        {subtitle ? <p className="section-head__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="section-head__action">{action}</div> : null}
    </header>
  );
}

export default SectionHeading;
