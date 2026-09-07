'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EditProfileForm } from './EditProfileForm';

/**
 * Wraps the read-only profile content. When `canEdit` (i.e. this is your own
 * profile) it adds an "Edit my profile" toggle above it; clicking swaps the
 * whole read-only block for `EditProfileForm` instead of trying to swap
 * individual panels in place - simpler, and every self-editable field lives
 * in one form regardless of where it's displayed in the read-only view.
 *
 * @param {{ employee: import('@/lib/types').Employee, canEdit: boolean, children: import('react').ReactNode }} props
 */
export function ProfileEditGate({ employee, canEdit, children }) {
  const [editing, setEditing] = useState(false);

  if (canEdit && editing) {
    return (
      <section className="section section--tight">
        <div className="container-page container-narrow">
          <EditProfileForm
            employee={employee}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      {canEdit ? (
        <section className="section section--tight">
          <div className="container-page">
            <Button variant="outline" size="sm" icon="Edit" onClick={() => setEditing(true)}>
              Edit my profile
            </Button>
          </div>
        </section>
      ) : null}
      {children}
    </>
  );
}

export default ProfileEditGate;
