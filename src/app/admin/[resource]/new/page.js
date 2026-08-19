import { notFound } from 'next/navigation';
import { emptyRecord, getAdminSchema } from '@/lib/adminSchemas';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

/** @param {{ params: Promise<{ resource: string }> }} props */
export async function generateMetadata({ params }) {
  const { resource } = await params;
  const schema = getAdminSchema(resource);
  return { title: schema ? `New ${schema.label} - Admin` : 'Admin', robots: { index: false } };
}

/** `/admin/[resource]/new` - creation form for any managed collection. */
export default async function AdminCreatePage({ params }) {
  const { resource } = await params;
  const schema = getAdminSchema(resource);
  if (!schema || schema.readOnlyCreate) notFound();

  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">New {schema.label.toLowerCase()}</h2>
          <p className="u-text-sm u-muted">
            Fields marked with * are required. Anything left blank shows as a placeholder on the portal.
          </p>
        </div>
        <Button href={ROUTES.adminResource(resource)} variant="outline" icon="ArrowBack">
          Back to {schema.labelPlural.toLowerCase()}
        </Button>
      </div>

      <ResourceForm resource={resource} schema={schema} initialValues={emptyRecord(schema)} />
    </>
  );
}
