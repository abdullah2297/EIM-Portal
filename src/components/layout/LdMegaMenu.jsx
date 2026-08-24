'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/lib/constants';

/**
 * L&D nav item: a hover/focus mega-menu with three levels (Training Type ->
 * Category -> sample courses), plus a "Browse All Training" escape hatch.
 *
 * Visibility of the panel is pure CSS (`:hover`/`:focus-within` on `.ld-menu`,
 * see `_header.scss`) so it behaves like a normal flyout with the mouse or the
 * keyboard; which type's categories are shown inside is the only bit of local
 * state, switched on hover/focus of a type row.
 *
 * @param {{
 *  ldNav: { types: Array<{ id: string, name: string, icon?: string, categories: Array<{ id: string, name: string, courses: Array<{ id: string, name: string }> }> }> },
 *  active?: boolean,
 * }} props
 */
export function LdMegaMenu({ ldNav, active = false }) {
  const types = ldNav?.types ?? [];
  const [activeTypeId, setActiveTypeId] = useState(types[0]?.id ?? null);
  const activeType = types.find((type) => type.id === activeTypeId) ?? types[0] ?? null;

  return (
    <div className="ld-menu">
      <Link
        href={ROUTES.learning}
        className={`nav-link ld-menu__trigger ${active ? 'nav-link--active' : ''}`.trim()}
        aria-current={active ? 'page' : undefined}
      >
        <Icon name="School" fontSize="inherit" />
        L&amp;D
        <Icon name="ExpandMore" fontSize="inherit" className="ld-menu__caret" />
      </Link>

      <div className="ld-menu__panel">
        <div className="ld-menu__column ld-menu__column--types">
          {types.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`ld-menu__type ${type.id === activeType?.id ? 'ld-menu__type--active' : ''}`.trim()}
              onMouseEnter={() => setActiveTypeId(type.id)}
              onFocus={() => setActiveTypeId(type.id)}
            >
              <Icon name={type.icon || 'School'} fontSize="small" />
              <span>{type.name}</span>
              <Icon name="ChevronRight" fontSize="inherit" className="ld-menu__type-caret" />
            </button>
          ))}
          {!types.length ? <p className="ld-menu__empty">Training types will appear here.</p> : null}
          <Link href={ROUTES.learning} className="ld-menu__browse-all">
            <Icon name="MenuBook" fontSize="small" />
            Browse All Training
          </Link>
        </div>

        {activeType ? (
          <div className="ld-menu__column ld-menu__column--categories">
            {activeType.categories.map((category) => (
              <div className="ld-menu__category" key={category.id}>
                <span className="ld-menu__category-title">{category.name}</span>
                {category.courses.length ? (
                  <ul className="ld-menu__courses">
                    {category.courses.map((course) => (
                      <li key={course.id}>
                        <Link href={ROUTES.learningItem(course.id)}>{course.name}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ld-menu__empty">No courses yet.</p>
                )}
                <Link
                  href={`${ROUTES.learning}?category=${encodeURIComponent(category.id)}`}
                  className="ld-menu__browse"
                >
                  Browse All
                  <Icon name="ArrowForward" fontSize="inherit" />
                </Link>
              </div>
            ))}
            {!activeType.categories.length ? (
              <p className="ld-menu__empty">Categories will appear here.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default LdMegaMenu;
