'use client';

import MuiPagination from '@mui/material/Pagination';

/**
 * Result counter plus page control. Renders nothing when there is a single page.
 *
 * @param {{ page: number, totalPages: number, total?: number, pageSize?: number, onChange: (page: number) => void }} props
 */
export function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const from = total && pageSize ? (page - 1) * pageSize + 1 : null;
  const to = total && pageSize ? Math.min(page * pageSize, total) : null;

  return (
    <nav className="u-cluster justify-between pt-6" aria-label="Pagination">
      {from ? (
        <p className="u-text-sm u-muted">
          Showing <strong>{from}</strong>-<strong>{to}</strong> of <strong>{total}</strong>
        </p>
      ) : (
        <span />
      )}
      <MuiPagination
        page={page}
        count={totalPages}
        onChange={(_event, value) => onChange(value)}
        color="primary"
        shape="rounded"
        siblingCount={0}
        boundaryCount={1}
      />
    </nav>
  );
}

export default Pagination;
