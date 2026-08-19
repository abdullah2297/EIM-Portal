'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/lib/constants';

/**
 * Header search box. Submitting sends the visitor to the full `/search` page,
 * which owns the grouped results, loading and empty states.
 *
 * @param {{ className?: string, autoFocus?: boolean, onSubmitted?: () => void }} props
 */
export function GlobalSearch({ className = 'header-search', autoFocus = false, onSubmitted }) {
  const [term, setTerm] = useState('');
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = term.trim();
    if (!value) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(value)}`);
    onSubmitted?.();
  };

  return (
    <form className={className} role="search" onSubmit={handleSubmit}>
      <label className="u-sr-only" htmlFor="global-search">
        Search the portal
      </label>
      <span className="header-search__icon">
        <Icon name="Search" />
      </span>
      <input
        id="global-search"
        type="search"
        className="header-search__input"
        placeholder="Search people, teams, news..."
        value={term}
        autoFocus={autoFocus}
        onChange={(event) => setTerm(event.target.value)}
      />
    </form>
  );
}

export default GlobalSearch;
