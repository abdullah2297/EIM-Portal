'use client';

/**
 * Lightweight tab bar. Purely presentational: the parent owns the active key,
 * which keeps tabs shareable via the URL when a page needs that.
 *
 * @param {{
 *  tabs: Array<{ key: string, label: string, count?: number }>,
 *  active: string,
 *  onChange: (key: string) => void,
 *  ariaLabel?: string,
 * }} props
 */
export function Tabs({ tabs = [], active, onChange, ariaLabel = 'Sections' }) {
  return (
    <div className="tab-bar" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          id={`tab-${tab.key}`}
          aria-selected={tab.key === active}
          aria-controls={`panel-${tab.key}`}
          className={`tab-bar__tab ${tab.key === active ? 'tab-bar__tab--active' : ''}`.trim()}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
        </button>
      ))}
    </div>
  );
}

/** @param {{ tabKey: string, active: string, children: import('react').ReactNode }} props */
export function TabPanel({ tabKey, active, children }) {
  if (tabKey !== active) return null;
  return (
    <div role="tabpanel" id={`panel-${tabKey}`} aria-labelledby={`tab-${tabKey}`}>
      {children}
    </div>
  );
}

export default Tabs;
