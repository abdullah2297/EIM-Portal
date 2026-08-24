'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

/**
 * Header search box. Submitting sends the visitor to the full `/search` page,
 * which owns the grouped results, loading and empty states.
 *
 * With `collapsible`, the box starts as a plain icon button and expands into
 * the input on click - collapsing again on submit, Escape, or a click
 * outside - instead of always taking up space in the nav.
 *
 * @param {{ className?: string, collapsible?: boolean, onSubmitted?: () => void }} props
 */
export function GlobalSearch({ className = 'header-search', collapsible = false, onSubmitted }) {
  const [expanded, setExpanded] = useState(!collapsible);
  const [term, setTerm] = useState('');
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const router = useRouter();

  const collapse = () => {
    if (!collapsible) return;
    setExpanded(false);
    setTerm('');
  };

  useEffect(() => {
    if (expanded && collapsible) inputRef.current?.focus();
  }, [expanded, collapsible]);

  useEffect(() => {
    if (!collapsible || !expanded) return;
    const onPointerDown = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) collapse();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') collapse();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [collapsible, expanded]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = term.trim();
    if (!value) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(value)}`);
    onSubmitted?.();
    collapse();
  };

  if (collapsible && !expanded) {
    return (
      <IconButton
        icon="Search"
        label="Search the portal"
        onClick={() => setExpanded(true)}
        className={`${className}-trigger`}
      />
    );
  }

  return (
    <form
      ref={formRef}
      className={`${className} ${collapsible ? `${className}--expanded` : ''}`.trim()}
      role="search"
      onSubmit={handleSubmit}
    >
      <label className="u-sr-only" htmlFor="global-search">
        Search the portal
      </label>
      <span className="header-search__icon">
        <Icon name="Search" />
      </span>
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        className="header-search__input"
        placeholder="Search people, teams, news..."
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
    </form>
  );
}

export default GlobalSearch;
