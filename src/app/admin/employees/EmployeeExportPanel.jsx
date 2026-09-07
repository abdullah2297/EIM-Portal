'use client';

import { useState } from 'react';
import { employeesService, teamsService, subTeamsService } from '@/services';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Overlays';
import { CheckboxField } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { toCsv, downloadCsv } from '@/lib/csv';

const EXPORT_FIELDS = [
  { key: 'fullName', label: 'Name' },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'role', label: 'Role' },
  { key: 'teamName', label: 'Team' },
  { key: 'subTeamName', label: 'Sub-team' },
  { key: 'email', label: 'Email' },
  { key: 'extension', label: 'Extension' },
  { key: 'location', label: 'Location' },
  { key: 'joinedDate', label: 'Joined date' },
  { key: 'mobileNumber', label: 'Mobile number' },
  { key: 'computerNumber', label: 'Computer number' },
  { key: 'totalExperienceYears', label: 'Total experience (years)' },
  { key: 'bio', label: 'Short introduction' },
  { key: 'quote', label: 'Personal quote' },
  { key: 'expertise', label: 'Areas of expertise' },
  { key: 'skills', label: 'Skills' },
  { key: 'hobbies', label: 'Hobbies' },
  { key: 'interests', label: 'Interests' },
  { key: 'funFacts', label: 'Fun facts' },
  { key: 'languages', label: 'Languages' },
  { key: 'educationUniversity', label: 'University' },
  { key: 'educationMajor', label: 'Major' },
  { key: 'educationGraduationYear', label: 'Graduation year' },
  { key: 'projects', label: 'Projects' },
  { key: 'resumeUrl', label: 'Resume URL' },
  { key: 'featured', label: 'Featured' },
];

/** Flattens one employee (+ resolved team/sub-team names) into one CSV row. */
function buildRow(employee, teamsById, subTeamsById) {
  return {
    fullName: employee.fullName,
    jobTitle: employee.jobTitle,
    role: employee.role,
    teamName: teamsById[employee.teamId]?.name ?? '',
    subTeamName: subTeamsById[employee.subTeamId]?.name ?? '',
    email: employee.email,
    extension: employee.extension,
    location: employee.location,
    joinedDate: employee.joinedDate,
    mobileNumber: employee.mobileNumber,
    computerNumber: employee.computerNumber,
    totalExperienceYears: employee.totalExperienceYears,
    bio: employee.bio,
    quote: employee.quote,
    expertise: (employee.expertise ?? []).join('; '),
    skills: (employee.skills ?? []).map((skill) => `${skill.name} (${skill.level}%)`).join('; '),
    hobbies: (employee.hobbies ?? []).join('; '),
    interests: (employee.interests ?? []).join('; '),
    funFacts: (employee.funFacts ?? []).join('; '),
    languages: (employee.languages ?? []).join('; '),
    educationUniversity: employee.educationUniversity,
    educationMajor: employee.educationMajor,
    educationGraduationYear: employee.educationGraduationYear,
    projects: (employee.projects ?? [])
      .map((project) => `${project.name} (${project.status})${project.description ? `: ${project.description}` : ''}${project.link ? ` [${project.link}]` : ''}`)
      .join(' | '),
    resumeUrl: employee.resume?.url ?? '',
    featured: employee.featured ? 'Yes' : 'No',
  };
}

/**
 * "Export CSV" button + field-picker for the employees admin list - lets an
 * admin choose exactly which columns to include before downloading.
 */
export function EmployeeExportPanel() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set(EXPORT_FIELDS.map((field) => field.key)));
  const [exporting, setExporting] = useState(false);
  const { notify } = useToast();

  const toggleField = (key) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = async () => {
    if (!selected.size) {
      notify('Select at least one field to export.', 'warning');
      return;
    }

    setExporting(true);
    try {
      const [employees, teams, subTeams] = await Promise.all([
        employeesService.list({ pageSize: 1000 }),
        teamsService.list({ pageSize: 200 }),
        subTeamsService.list({ pageSize: 200 }),
      ]);
      const teamsById = Object.fromEntries(teams.items.map((team) => [team.id, team]));
      const subTeamsById = Object.fromEntries(subTeams.items.map((subTeam) => [subTeam.id, subTeam]));

      const columns = EXPORT_FIELDS.filter((field) => selected.has(field.key));
      const rows = employees.items.map((employee) => buildRow(employee, teamsById, subTeamsById));

      downloadCsv(`employees-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, columns));
      notify(`Exported ${rows.length} employee(s).`, 'success');
      setOpen(false);
    } catch (error) {
      notify(error?.message ?? 'The export could not be completed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" icon="FolderZip" onClick={() => setOpen(true)}>
        Export CSV
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Export employees to CSV"
        maxWidth="sm"
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button icon="Download" loading={exporting} onClick={handleExport}>
              Export {selected.size} field(s)
            </Button>
          </>
        }
      >
        <p className="u-text-sm u-muted mb-4">Choose which fields to include in the exported file.</p>
        <div className="grid-auto grid-auto--2">
          {EXPORT_FIELDS.map((field) => (
            <CheckboxField
              key={field.key}
              label={field.label}
              name={field.key}
              checked={selected.has(field.key)}
              onChange={() => toggleField(field.key)}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}

export default EmployeeExportPanel;
