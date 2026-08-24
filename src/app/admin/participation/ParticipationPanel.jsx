'use client';

import { useMemo, useState } from 'react';
import {
  employeesService,
  trainingCategoriesService,
  trainingRegistrationsService,
  trainingsService,
  trainingTypesService,
} from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/context/ToastContext';
import { DataState } from '@/components/ui/StateViews';
import { SearchInput, SelectField, TextInput } from '@/components/ui/Fields';
import { Button, IconButton } from '@/components/ui/Button';
import { REGISTRATION_STATUS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { downloadCsv, toCsv } from '@/lib/csv';

const ALL = 'all';
const REGISTRATION_KEYS = ['Registered', 'Waitlisted', 'Approved', 'Cancelled'];
const ATTENDANCE_KEYS = ['Attended', 'No Show'];
const COMPLETION_KEYS = ['Completed', 'Not Completed'];

const CSV_COLUMNS = [
  { key: 'trainingName', label: 'Training Name' },
  { key: 'typeName', label: 'Training Type' },
  { key: 'categoryName', label: 'Category' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'email', label: 'Email' },
  { key: 'computerNumber', label: 'Computer Number' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'registrationDate', label: 'Registration Date' },
  { key: 'registrationStatus', label: 'Registration Status' },
  { key: 'attendanceStatus', label: 'Attendance Status' },
  { key: 'completionStatus', label: 'Completion Status' },
];

/**
 * Admin-only cross-training participation view: search/filter every
 * registration in one table, update status inline, cancel, and export to CSV.
 * Joins the existing generic resources in memory rather than adding a new
 * API route (small dataset, all already admin-gated).
 */
export function ParticipationPanel() {
  const [term, setTerm] = useState('');
  const [trainingId, setTrainingId] = useState(ALL);
  const [categoryId, setCategoryId] = useState(ALL);
  const [typeId, setTypeId] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedTerm = useDebouncedValue(term, 250);
  const { notify } = useToast();

  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      Promise.all([
        trainingRegistrationsService.list({ pageSize: 200 }),
        trainingsService.list({ pageSize: 200 }),
        trainingCategoriesService.list({ pageSize: 200 }),
        trainingTypesService.list({ pageSize: 200 }),
        employeesService.list({ pageSize: 200 }),
      ]),
    [],
  );

  const rows = useMemo(() => {
    const [registrations, trainings, categories, types, employees] = data ?? [[], [], [], [], []];
    const trainingsById = Object.fromEntries((trainings.items ?? []).map((t) => [t.id, t]));
    const categoriesById = Object.fromEntries((categories.items ?? []).map((c) => [c.id, c]));
    const typesById = Object.fromEntries((types.items ?? []).map((t) => [t.id, t]));
    const employeesById = Object.fromEntries((employees.items ?? []).map((e) => [e.id, e]));

    return (registrations.items ?? []).map((registration) => {
      const training = trainingsById[registration.trainingId] ?? null;
      const category = training ? categoriesById[training.categoryId] ?? null : null;
      const type = category ? typesById[category.trainingTypeId] ?? null : null;
      const employee = employeesById[registration.employeeId] ?? null;

      return {
        registrationId: registration.id,
        trainingId: registration.trainingId,
        trainingName: training?.name ?? 'PLACEHOLDER - training removed',
        categoryId: training?.categoryId ?? null,
        categoryName: category?.name ?? '',
        typeId: category?.trainingTypeId ?? null,
        typeName: type?.name ?? '',
        employeeId: registration.employeeId,
        employeeName: employee?.fullName ?? 'PLACEHOLDER - employee removed',
        email: employee?.email ?? '',
        computerNumber: registration.computerNumber ?? '',
        phoneNumber: registration.phoneNumber ?? '',
        status: registration.status,
        registeredAt: registration.createdAt,
      };
    });
  }, [data]);

  const trainingOptions = useMemo(() => {
    const trainings = data?.[1]?.items ?? [];
    return trainings.map((t) => ({ value: t.id, label: t.name }));
  }, [data]);

  const categoryOptions = useMemo(() => {
    const categories = data?.[2]?.items ?? [];
    return categories.map((c) => ({ value: c.id, label: c.name }));
  }, [data]);

  const typeOptions = useMemo(() => {
    const types = data?.[3]?.items ?? [];
    return types.map((t) => ({ value: t.id, label: t.name }));
  }, [data]);

  const filtered = rows.filter((row) => {
    if (trainingId !== ALL && row.trainingId !== trainingId) return false;
    if (categoryId !== ALL && row.categoryId !== categoryId) return false;
    if (typeId !== ALL && row.typeId !== typeId) return false;
    if (status !== ALL && row.status !== status) return false;
    if (dateFrom && (!row.registeredAt || row.registeredAt.slice(0, 10) < dateFrom)) return false;
    if (dateTo && (!row.registeredAt || row.registeredAt.slice(0, 10) > dateTo)) return false;
    if (debouncedTerm) {
      const needle = debouncedTerm.trim().toLowerCase();
      const haystack = `${row.employeeName} ${row.email} ${row.computerNumber}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const handleStatusChange = async (row, nextStatus) => {
    try {
      await trainingRegistrationsService.update(row.registrationId, { status: nextStatus });
      notify(`Status updated for ${row.employeeName}.`, 'success');
      refetch();
    } catch (updateError) {
      notify(updateError?.message ?? 'The status could not be updated.', 'error');
    }
  };

  const handleExport = () => {
    const csvRows = filtered.map((row) => ({
      trainingName: row.trainingName,
      typeName: row.typeName,
      categoryName: row.categoryName,
      employeeName: row.employeeName,
      email: row.email,
      computerNumber: row.computerNumber,
      phoneNumber: row.phoneNumber,
      registrationDate: formatDate(row.registeredAt, 'short'),
      registrationStatus: REGISTRATION_KEYS.includes(row.status) ? row.status : '',
      attendanceStatus: ATTENDANCE_KEYS.includes(row.status) ? row.status : '',
      completionStatus: COMPLETION_KEYS.includes(row.status) ? row.status : '',
    }));
    downloadCsv(`participation-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(csvRows, CSV_COLUMNS));
    notify(`Exported ${csvRows.length} record(s).`, 'success');
  };

  return (
    <>
      <div className="filter-bar">
        <SearchInput value={term} onChange={setTerm} placeholder="Search name, email, computer number..." />
        <div className="filter-bar__footer">
          <SelectField
            label="Training"
            name="trainingId"
            value={trainingId}
            onChange={(_, value) => setTrainingId(value)}
            options={[{ value: ALL, label: 'All trainings' }, ...trainingOptions]}
          />
          <SelectField
            label="Category"
            name="categoryId"
            value={categoryId}
            onChange={(_, value) => setCategoryId(value)}
            options={[{ value: ALL, label: 'All categories' }, ...categoryOptions]}
          />
          <SelectField
            label="Training type"
            name="typeId"
            value={typeId}
            onChange={(_, value) => setTypeId(value)}
            options={[{ value: ALL, label: 'All types' }, ...typeOptions]}
          />
          <SelectField
            label="Status"
            name="status"
            value={status}
            onChange={(_, value) => setStatus(value)}
            options={[{ value: ALL, label: 'All statuses' }, ...REGISTRATION_STATUS.map((s) => ({ value: s, label: s }))]}
          />
          <TextInput label="Registered from" name="dateFrom" type="date" value={dateFrom} onChange={(_, value) => setDateFrom(value)} />
          <TextInput label="Registered to" name="dateTo" type="date" value={dateTo} onChange={(_, value) => setDateTo(value)} />
        </div>
        <div className="filter-bar__footer">
          <span className="u-text-sm u-muted">
            <strong>{filtered.length}</strong> record(s)
          </span>
          <Button variant="outline" icon="FolderZip" onClick={handleExport} className="md:ml-auto">
            Export CSV
          </Button>
        </div>
      </div>

      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={filtered.length === 0}
        onRetry={refetch}
        skeletonCount={3}
        skeletonClassName="u-stack"
        emptyProps={{
          icon: 'HowToReg',
          title: 'No registrations match',
          message: 'Adjust the search or filters above.',
        }}
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Email</th>
                <th scope="col">Training</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Computer #</th>
                <th scope="col">Phone</th>
                <th scope="col">Registered</th>
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.registrationId}>
                  <td>
                    <strong>{row.employeeName}</strong>
                  </td>
                  <td>{row.email}</td>
                  <td>{row.trainingName}</td>
                  <td>{row.categoryName}</td>
                  <td>
                    <select
                      className="select"
                      value={row.status}
                      onChange={(event) => handleStatusChange(row, event.target.value)}
                    >
                      {REGISTRATION_STATUS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{row.computerNumber}</td>
                  <td>{row.phoneNumber}</td>
                  <td>{formatDate(row.registeredAt, 'short')}</td>
                  <td>
                    <div className="admin-table__actions">
                      {row.status !== 'Cancelled' ? (
                        <IconButton
                          icon="Cancel"
                          label={`Cancel ${row.employeeName}'s registration`}
                          onClick={() => handleStatusChange(row, 'Cancelled')}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </>
  );
}

export default ParticipationPanel;
