'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SERVICE_BY_RESOURCE } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/context/ToastContext';
import { SearchInput } from '@/components/ui/Fields';
import { DataState } from '@/components/ui/StateViews';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/Overlays';
import { Button, IconButton } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { PAGE_SIZE, ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/**
 * Generic listing table for one collection: search, pagination, edit and
 * delete. Columns come from the resource's admin schema.
 *
 * @param {{ resource: string, schema: any }} props
 */
export function ResourceTable({ resource, schema }) {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { notify } = useToast();

  const service = SERVICE_BY_RESOURCE[resource];

  const { data, error, isLoading, refetch } = useAsyncData(
    () => service.list({ q: debouncedTerm, page, pageSize: PAGE_SIZE.admin }),
    [resource, debouncedTerm, page],
  );

  const items = data?.items ?? [];
  const meta = data?.meta ?? null;

  // Relation columns need a lookup of the referenced collection.
  const relationResources = useMemo(
    () => [
      ...new Set(
        schema.columns
          .filter((column) => column.relation || column.relations)
          .map((column) => column.relation || column.relations),
      ),
    ],
    [schema],
  );

  const { data: relationData } = useAsyncData(async () => {
    const entries = await Promise.all(
      relationResources.map(async (name) => {
        const { items: related } = await SERVICE_BY_RESOURCE[name].list({ pageSize: 200 });
        return [name, Object.fromEntries(related.map((item) => [item.id, item]))];
      }),
    );
    return Object.fromEntries(entries);
  }, [relationResources.join(',')]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await service.remove(pendingDelete.id);
      notify(`${schema.label} deleted.`, 'success');
      setPendingDelete(null);
      refetch();
    } catch (deleteError) {
      notify(deleteError?.message ?? 'The record could not be deleted.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const renderCell = (item, column) => {
    const raw = item[column.key];

    if (column.relation) {
      const related = relationData?.[column.relation]?.[raw];
      return related ? (related[column.labelField] ?? related.name ?? related.title) : '--';
    }
    if (column.relations) {
      const lookup = relationData?.[column.relations] ?? {};
      const labels = (Array.isArray(raw) ? raw : [])
        .map((id) => lookup[id])
        .filter(Boolean)
        .map((related) => related[column.labelField] ?? related.name ?? related.title);
      return labels.length ? labels.join(', ') : '--';
    }
    if (column.boolean) {
      return raw ? <Badge tone="success" icon="CheckCircle">Yes</Badge> : <span className="u-subtle">No</span>;
    }
    if (column.date) return formatDate(raw, 'short');
    if (column.badge) return <StatusBadge status={raw} />;
    if (column.primary) {
      return (
        <span className="admin-cell-primary">
          {column.avatar ? <Avatar name={String(raw ?? '?')} src={item.photo} size="sm" /> : null}
          <strong>{raw ?? '--'}</strong>
        </span>
      );
    }
    return raw ?? '--';
  };

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <SearchInput
            value={term}
            onChange={(value) => {
              setTerm(value);
              setPage(1);
            }}
            placeholder={`Search ${schema.labelPlural.toLowerCase()}...`}
          />
        </div>
        <span className="u-text-sm u-muted">
          {meta ? `${meta.total} record(s)` : 'Loading...'}
        </span>
        {schema.readOnlyCreate ? null : (
          <Button href={ROUTES.adminResourceNew(resource)} icon="Add" className="md:ml-auto">
            New {schema.label.toLowerCase()}
          </Button>
        )}
      </div>

      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={refetch}
        skeletonCount={3}
        skeletonClassName="u-stack"
        emptyProps={{
          icon: schema.icon,
          title: `No ${schema.labelPlural.toLowerCase()} yet`,
          message: term
            ? 'No records match that search. Try a different term.'
            : `Create the first ${schema.label.toLowerCase()} to get started.`,
          actionLabel: schema.readOnlyCreate ? undefined : `New ${schema.label.toLowerCase()}`,
          actionHref: schema.readOnlyCreate ? undefined : ROUTES.adminResourceNew(resource),
        }}
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {schema.columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {schema.columns.map((column) => (
                    <td key={column.key}>{renderCell(item, column)}</td>
                  ))}
                  <td>
                    <div className="admin-table__actions">
                      <IconButton
                        icon="Edit"
                        label={`Edit ${item[schema.columns[0].key] ?? item.id}`}
                        href={ROUTES.adminResourceEdit(resource, item.id)}
                      />
                      <IconButton
                        icon="Delete"
                        label={`Delete ${item[schema.columns[0].key] ?? item.id}`}
                        onClick={() => setPendingDelete(item)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>

      {meta ? (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          pageSize={meta.pageSize}
          onChange={setPage}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete this ${schema.label.toLowerCase()}?`}
        message={`"${pendingDelete?.[schema.columns[0].key] ?? ''}" will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      <p className="u-text-xs u-subtle mt-4">
        <Icon name="InfoOutlined" fontSize="inherit" /> Changes are written straight to the JSON data
        files and appear on the public site immediately.{' '}
        <Link href="/" className="u-brand">
          Open the portal
        </Link>
      </p>
    </>
  );
}

export default ResourceTable;
