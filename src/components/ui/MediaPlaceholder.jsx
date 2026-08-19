import { Icon } from './Icon';
import { PLACEHOLDER } from '@/lib/constants';

/**
 * Renders an image when one exists, and an explicit, labelled placeholder when
 * it does not - so it is always obvious which visuals still need real assets.
 *
 * @param {{
 *  src?: string | null,
 *  alt?: string,
 *  label?: string,
 *  icon?: string,
 *  variant?: 'accent'|'brand'|'gold',
 *  className?: string,
 * }} props
 */
export function MediaPlaceholder({
  src,
  alt = '',
  label = PLACEHOLDER.image,
  icon = 'PhotoLibrary',
  variant = 'accent',
  className = '',
}) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  }

  const classes = ['media-placeholder', variant !== 'accent' ? `media-placeholder--${variant}` : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="img" aria-label={`${label}${alt ? ` - ${alt}` : ''}`}>
      <span className="media-placeholder__label">
        <Icon name={icon} fontSize="medium" />
        {label}
      </span>
    </div>
  );
}

export default MediaPlaceholder;
