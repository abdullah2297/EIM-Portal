import { notFound } from 'next/navigation';
import { getAdminSchema } from '@/lib/adminSchemas';
import { ResourceTable } from '@/components/admin/ResourceTable';
import { Button } from '@/components/ui/Button';
import { EmployeeExportPanel } from '@/app/admin/employees/EmployeeExportPanel';
import { ROUTES, RESOURCES } from '@/lib/constants';

/** @param {{ params: Promise<{ resource: string }> }} props */
export async function generateMetadata({ params }) {
  const { resource } = await params;
  const schema = getAdminSchema(resource);
  return { title: schema ? `${schema.labelPlural} - Admin` : 'Admin', robots: { index: false } };
}

/** `/admin/[resource]` - listing screen for any managed collection. */
export default async function AdminResourcePage({ params }) {
  const { resource } = await params;
  const schema = getAdminSchema(resource);
  if (!schema) notFound();

  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">{schema.labelPlural}</h2>
          <p className="u-text-sm u-muted">
            {schema.readOnlyCreate
              ? 'Records arrive from the public forms. You can update the status or delete them here.'
              : `Create, edit and delete ${schema.labelPlural.toLowerCase()} shown on the portal.`}
          </p>
        </div>
        <div className="u-cluster u-cluster--sm">
          {resource === RESOURCES.employees ? <EmployeeExportPanel /> : null}
          {schema.readOnlyCreate ? null : (
            <Button href={ROUTES.adminResourceNew(resource)} icon="Add">
              New {schema.label.toLowerCase()}
            </Button>
          )}
        </div>
      </div>

      <ResourceTable resource={resource} schema={schema} />
    </>
  );
}
