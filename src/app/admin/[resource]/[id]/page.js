import { notFound } from 'next/navigation';
import { emptyRecord, getAdminSchema } from '@/lib/adminSchemas';
import { findById } from '@/lib/db';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/** @param {{ params: Promise<{ resource: string, id: string }> }} props */
export async function generateMetadata({ params }) {
  const { resource } = await params;
  const schema = getAdminSchema(resource);
  return { title: schema ? `Edit ${schema.label} - Admin` : 'Admin', robots: { index: false } };
}

/** `/admin/[resource]/[id]` - edit form for a single record. */
export default async function AdminEditPage({ params }) {
  const { resource, id } = await params;
  const schema = getAdminSchema(resource);
  if (!schema) notFound();

  const record = await findById(resource, id);
  if (!record) notFound();

  // Merge onto an empty record so fields added to the schema later still render.
  const initialValues = { ...emptyRecord(schema), ...record };

  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">Edit {schema.label.toLowerCase()}</h2>
          <p className="u-text-sm u-muted">
            Record <code>{record.id}</code>
            {record.updatedAt ? ` - last updated ${formatDate(record.updatedAt, 'short')}` : ''}
          </p>
        </div>
        <Button href={ROUTES.adminResource(resource)} variant="outline" icon="ArrowBack">
          Back to {schema.labelPlural.toLowerCase()}
        </Button>
      </div>

      <ResourceForm resource={resource} schema={schema} initialValues={initialValues} recordId={record.id} />
    </>
  );
}
