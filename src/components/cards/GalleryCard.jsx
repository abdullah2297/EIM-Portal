'use client';

import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { formatDate } from '@/lib/format';

/**
 * Gallery tile. Every fourth item spans two columns on larger screens so the
 * grid keeps a magazine rhythm rather than a flat matrix.
 *
 * @param {{ item: import('@/lib/types').GalleryItem, wide?: boolean, onOpen?: (item: any) => void }} props
 */
export function GalleryCard({ item, wide = false, onOpen }) {
  return (
    <button
      type="button"
      className={`gallery-item ${wide ? 'gallery-item--wide' : ''}`.trim()}
      onClick={() => onOpen?.(item)}
      aria-label={`Open ${item.title}`}
    >
      <MediaPlaceholder src={item.image} alt={item.title} icon="PhotoLibrary" variant={wide ? 'brand' : 'accent'} />
      <span className="gallery-item__overlay">
        <span className="gallery-item__title">{item.title}</span>
        <span className="gallery-item__meta">
          {item.event} - {formatDate(item.date, 'short')}
        </span>
      </span>
    </button>
  );
}

export default GalleryCard;
