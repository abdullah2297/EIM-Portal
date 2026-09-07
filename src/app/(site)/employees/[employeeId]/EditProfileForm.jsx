'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { employeeProfileService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { TagInput, TextArea, TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Repeater } from '@/components/admin/Repeater';
import { ImageField } from '@/components/admin/ImageField';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { RelationMultiSelect } from '@/components/admin/RelationFields';
import { PROJECT_STATUS, RESOURCES } from '@/lib/constants';

const asOptions = (values) => values.map((value) => ({ value, label: value }));

/**
 * Self-service profile editor - everything an employee is allowed to change
 * about themselves. Deliberately excludes org-structure/identity fields
 * (full name, role, team, sub-team, email, featured flag, computer number)
 * and anything training/registration-related, which isn't part of the
 * employee record at all. Posts straight to `/api/employees/me`, which
 * enforces the exact same allowlist server-side - this form is a
 * convenience, not the actual security boundary.
 *
 * @param {{ employee: import('@/lib/types').Employee, onSaved: () => void, onCancel: () => void }} props
 */
export function EditProfileForm({ employee, onSaved, onCancel }) {
  const [values, setValues] = useState({
    jobTitle: employee.jobTitle ?? '',
    extension: employee.extension ?? '',
    location: employee.location ?? '',
    photo: employee.photo ?? '',
    bio: employee.bio ?? '',
    quote: employee.quote ?? '',
    expertise: employee.expertise ?? [],
    skills: employee.skills ?? [],
    hobbies: employee.hobbies ?? [],
    interests: employee.interests ?? [],
    funFacts: employee.funFacts ?? [],
    languages: employee.languages ?? [],
    responsibilities: employee.responsibilities ?? [],
    achievements: employee.achievements ?? [],
    awards: employee.awards ?? [],
    initiativeIds: employee.initiativeIds ?? [],
    projects: employee.projects ?? [],
    educationUniversity: employee.educationUniversity ?? '',
    educationMajor: employee.educationMajor ?? '',
    educationGraduationYear: employee.educationGraduationYear ?? '',
    totalExperienceYears: employee.totalExperienceYears ?? '',
    mobileNumber: employee.mobileNumber ?? '',
    resume: employee.resume ?? null,
    joinedDate: employee.joinedDate ?? '',
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await employeeProfileService.update({
        ...values,
        totalExperienceYears: values.totalExperienceYears === '' ? null : Number(values.totalExperienceYears),
      });
      notify('Your profile has been updated.', 'success');
      router.refresh();
      onSaved?.();
    } catch (error) {
      notify(error instanceof ApiError ? error.message : 'Your profile could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <section className="admin-form__section">
        <h2 className="admin-form__section-title">Basics</h2>
        <div className="form-grid">
          <TextInput label="Job title" name="jobTitle" value={values.jobTitle} onChange={setValue} />
          <TextInput label="Extension" name="extension" value={values.extension} onChange={setValue} />
          <TextInput label="Location" name="location" value={values.location} onChange={setValue} />
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">About me</h2>
        <div className="form-grid">
          <div className="form-grid__full">
            <ImageField
              label="Photo"
              name="photo"
              value={values.photo}
              onChange={setValue}
              uploadFn={(file) => employeeProfileService.upload(file, 'image')}
            />
          </div>
          <TextArea label="Short introduction" name="bio" value={values.bio} onChange={setValue} rows={4} className="form-grid__full" />
          <TextInput label="Personal quote" name="quote" value={values.quote} onChange={setValue} className="form-grid__full" />
          <TagInput label="Areas of expertise" name="expertise" value={values.expertise} onChange={setValue} className="form-grid__full" />
          <div className="form-grid__full">
            <Repeater
              label="Skills"
              name="skills"
              value={values.skills}
              onChange={setValue}
              fields={[
                { name: 'name', label: 'Skill', type: 'text' },
                { name: 'level', label: 'Level (0-100)', type: 'number' },
              ]}
            />
          </div>
          <TagInput label="Hobbies" name="hobbies" value={values.hobbies} onChange={setValue} className="form-grid__full" />
          <TagInput label="Interests" name="interests" value={values.interests} onChange={setValue} className="form-grid__full" />
          <TagInput label="Fun facts" name="funFacts" value={values.funFacts} onChange={setValue} className="form-grid__full" />
          <TagInput label="Languages" name="languages" value={values.languages} onChange={setValue} className="form-grid__full" />
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">Role & responsibilities</h2>
        <div className="form-grid">
          <TagInput label="Responsibilities" name="responsibilities" value={values.responsibilities} onChange={setValue} className="form-grid__full" />
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">Projects</h2>
        <div className="form-grid">
          <div className="form-grid__full">
            <Repeater
              label="Projects"
              name="projects"
              value={values.projects}
              onChange={setValue}
              fields={[
                { name: 'name', label: 'Project name', type: 'text' },
                { name: 'description', label: 'Description', type: 'text' },
                { name: 'link', label: 'Link', type: 'text' },
                { name: 'status', label: 'Status', type: 'select', options: asOptions(PROJECT_STATUS) },
                { name: 'startDate', label: 'Start date', type: 'date' },
                { name: 'endDate', label: 'End date', type: 'date' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">Achievements & recognition</h2>
        <div className="form-grid">
          <TagInput label="Achievements" name="achievements" value={values.achievements} onChange={setValue} className="form-grid__full" />
          <div className="form-grid__full">
            <Repeater
              label="Awards & prizes"
              name="awards"
              value={values.awards}
              onChange={setValue}
              fields={[
                { name: 'title', label: 'Award', type: 'text' },
                { name: 'issuer', label: 'Issuer', type: 'text' },
                { name: 'year', label: 'Year', type: 'text' },
              ]}
            />
          </div>
          <div className="form-grid__full">
            <RelationMultiSelect
              label="Initiatives contributed to"
              name="initiativeIds"
              value={values.initiativeIds}
              onChange={setValue}
              resource={RESOURCES.initiatives}
              labelField="name"
            />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2 className="admin-form__section-title">Career</h2>
        <div className="form-grid">
          <TextInput label="Joined date" name="joinedDate" type="date" value={values.joinedDate} onChange={setValue} />
          <TextInput
            label="Total experience (years)"
            name="totalExperienceYears"
            type="number"
            value={values.totalExperienceYears}
            onChange={setValue}
          />
          <TextInput label="Mobile number" name="mobileNumber" value={values.mobileNumber} onChange={setValue} />
          <TextInput label="University" name="educationUniversity" value={values.educationUniversity} onChange={setValue} />
          <TextInput label="Major" name="educationMajor" value={values.educationMajor} onChange={setValue} />
          <TextInput label="Graduation year" name="educationGraduationYear" value={values.educationGraduationYear} onChange={setValue} />
          <div className="form-grid__full">
            <FileUploadField
              label="Resume"
              name="resume"
              value={values.resume}
              onChange={setValue}
              accept=".pdf"
              icon="Description"
              uploadLabel="Upload resume (PDF)"
              hint="PDF only, up to 10 MB."
              uploadFn={(file) => employeeProfileService.upload(file, 'document')}
            />
          </div>
        </div>
      </section>

      <div className="admin-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon="Save" loading={saving}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

export default EditProfileForm;
