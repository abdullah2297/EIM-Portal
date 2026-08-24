'use client';

import { useState } from 'react';
import { employeeAccountsService, ApiError } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { DataState } from '@/components/ui/StateViews';
import { ConfirmDialog, Modal } from '@/components/ui/Overlays';
import { RelationSelect } from '@/components/admin/RelationFields';
import { TextInput } from '@/components/ui/Fields';
import { Button, IconButton } from '@/components/ui/Button';
import { isValid, rules, validate } from '@/lib/validation';
import { RESOURCES } from '@/lib/constants';
import { ALL_SECTION_KEYS, SITE_SECTIONS } from '@/lib/siteSections';
import { formatDate } from '@/lib/format';

const CREATE_SCHEMA = {
  employeeId: [rules.required('Select an employee.')],
  password: [rules.required('Choose a password.'), rules.minLength(8, 'Use at least 8 characters.')],
};

const EMPTY_CREATE = { employeeId: '', password: '' };

/** Checkbox grid for the section list, shared by the create form and the edit dialog. */
function SectionCheckboxes({ value, onChange }) {
  const toggle = (key) => {
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);
  };

  return (
    <div className="u-stack u-stack--sm">
      <div className="u-cluster u-cluster--sm">
        <button type="button" className="u-text-xs u-brand" onClick={() => onChange(ALL_SECTION_KEYS)}>
          Select all
        </button>
        <button type="button" className="u-text-xs u-brand" onClick={() => onChange([])}>
          Clear all
        </button>
      </div>
      <div className="grid-auto grid-auto--3">
        {SITE_SECTIONS.map((section) => (
          <label className="checkbox-field" key={section.key}>
            <input
              type="checkbox"
              checked={value.includes(section.key)}
              onChange={() => toggle(section.key)}
            />
            <span>{section.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/** Admin-only account creation, listing and per-section permission management. */
export function EmployeeAccountsPanel() {
  const { data, error, isLoading, refetch } = useAsyncData(() => employeeAccountsService.list(), []);
  const accounts = data ?? [];
  const { notify } = useToast();

  const [creatingOpen, setCreatingOpen] = useState(false);
  const [createValues, setCreateValues] = useState(EMPTY_CREATE);
  const [createSections, setCreateSections] = useState(ALL_SECTION_KEYS);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState(null); // account being permission-edited
  const [editSections, setEditSections] = useState([]);
  const [saving, setSaving] = useState(false);

  const [pendingReset, setPendingReset] = useState(null);
  const [resetting, setResetting] = useState(false);

  const setCreateValue = (name, value) => {
    setCreateValues((current) => ({ ...current, [name]: value }));
    setCreateErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const nextErrors = validate(createValues, CREATE_SCHEMA);
    setCreateErrors(nextErrors);
    if (!isValid(nextErrors)) return;

    setCreating(true);
    try {
      await employeeAccountsService.create({ ...createValues, sections: createSections });
      notify('Account created.', 'success');
      setCreateValues(EMPTY_CREATE);
      setCreateSections(ALL_SECTION_KEYS);
      setCreatingOpen(false);
      refetch();
    } catch (createError) {
      if (createError instanceof ApiError && createError.details) setCreateErrors(createError.details);
      notify(createError?.message ?? 'The account could not be created.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (account) => {
    setEditing(account);
    setEditSections(account.sections ?? []);
  };

  const handleSavePermissions = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await employeeAccountsService.updatePermissions(editing.employeeId, editSections);
      notify(`${editing.fullName}'s permissions were updated.`, 'success');
      setEditing(null);
      refetch();
    } catch (saveError) {
      notify(saveError?.message ?? 'The permissions could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!pendingReset) return;
    setResetting(true);
    try {
      await employeeAccountsService.reset(pendingReset.employeeId);
      notify(`${pendingReset.fullName}'s account was reset.`, 'success');
      setPendingReset(null);
      refetch();
    } catch (resetError) {
      notify(resetError?.message ?? 'The account could not be reset.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const sectionsSummary = (sections) => {
    if (!sections?.length) return 'None';
    if (sections.length === ALL_SECTION_KEYS.length) return 'All';
    return sections.map((key) => SITE_SECTIONS.find((section) => section.key === key)?.label ?? key).join(', ');
  };

  return (
    <>
      <section className="admin-form__section">
        <div className="admin-page-head">
          <h2 className="admin-form__section-title">Accounts</h2>
          <Button icon="Add" onClick={() => setCreatingOpen(true)}>
            Create account
          </Button>
        </div>
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={accounts.length === 0}
          onRetry={refetch}
          skeletonCount={3}
          skeletonClassName="u-stack"
          emptyProps={{
            icon: 'Login',
            title: 'No accounts yet',
            message: 'Create the first one above.',
          }}
        >
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Email</th>
                  <th scope="col">Sections</th>
                  <th scope="col">Account created</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.employeeId}>
                    <td>
                      <strong>{account.fullName}</strong>
                    </td>
                    <td>{account.email}</td>
                    <td>{sectionsSummary(account.sections)}</td>
                    <td>{formatDate(account.createdAt, 'short')}</td>
                    <td>
                      <div className="admin-table__actions">
                        <IconButton
                          icon="Edit"
                          label={`Edit ${account.fullName}'s permissions`}
                          onClick={() => openEdit(account)}
                        />
                        <IconButton
                          icon="Delete"
                          label={`Reset ${account.fullName}'s account`}
                          onClick={() => setPendingReset(account)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataState>
      </section>

      <Modal
        open={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        title="Create an account"
        actions={
          <>
            <Button variant="ghost" onClick={() => setCreatingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} icon="Add" loading={creating}>
              Create account
            </Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleCreate}>
          <RelationSelect
            label="Employee"
            name="employeeId"
            value={createValues.employeeId}
            onChange={setCreateValue}
            resource={RESOURCES.employees}
            labelField="fullName"
            required
            error={createErrors.employeeId}
          />
          <TextInput
            label="Password"
            name="password"
            type="password"
            value={createValues.password}
            onChange={setCreateValue}
            error={createErrors.password}
            required
            hint="At least 8 characters - share it with the employee directly."
            autoComplete="new-password"
          />
          <div className="form-grid__full">
            <SectionCheckboxes value={createSections} onChange={setCreateSections} />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.fullName}'s permissions` : ''}
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <SectionCheckboxes value={editSections} onChange={setEditSections} />
        <p className="u-text-xs u-subtle mt-4">Takes effect immediately.</p>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingReset)}
        title="Reset this account?"
        message={`"${pendingReset?.fullName ?? ''}" will no longer be able to log in. There is no self-service signup, so you will need to create a new account for them here.`}
        confirmLabel="Reset"
        loading={resetting}
        onCancel={() => setPendingReset(null)}
        onConfirm={handleReset}
      />
    </>
  );
}

export default EmployeeAccountsPanel;
