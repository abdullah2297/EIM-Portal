'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import { Icon } from './Icon';
import { Button, IconButton } from './Button';

/**
 * Modal, confirmation dialog and dropdown menu, wrapping MUI so the rest of
 * the app never imports MUI directly.
 */

/**
 * @param {{
 *  open: boolean, onClose: () => void, title: string,
 *  children: import('react').ReactNode, actions?: import('react').ReactNode,
 *  maxWidth?: 'xs'|'sm'|'md'|'lg',
 * }} props
 */
export function Modal({ open, onClose, title, children, actions, maxWidth = 'sm' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth scroll="paper">
      <DialogTitle className="u-cluster">
        <span className="u-display">{title}</span>
        <IconButton icon="Close" label="Close dialog" onClick={onClose} className="ml-auto" />
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  );
}

/**
 * @param {{
 *  open: boolean, title?: string, message: string, confirmLabel?: string,
 *  onCancel: () => void, onConfirm: () => void, loading?: boolean, destructive?: boolean,
 * }} props
 */
export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
  loading = false,
  destructive = true,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle className="u-display">{title}</DialogTitle>
      <DialogContent>
        <p className="u-muted u-text-sm">{message}</p>
      </DialogContent>
      <DialogActions>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Dropdown menu. Defaults to an icon-only trigger (e.g. the header's "More
 * sections" overflow); pass `variant="nav"` for a labelled trigger styled
 * like the other primary nav links, used for grouped nav entries.
 * @param {{
 *  label: string, icon?: string, variant?: 'icon'|'nav', active?: boolean,
 *  items: Array<{ key: string, label: string, icon?: string, href?: string, onClick?: () => void }>,
 * }} props
 */
export function DropdownMenu({ label, icon = 'MoreHoriz', variant = 'icon', active = false, items = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      {variant === 'nav' ? (
        <button
          type="button"
          className={`nav-link nav-link--dropdown ${active ? 'nav-link--active' : ''}`.trim()}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-haspopup="true"
          aria-expanded={open}
        >
          {icon ? <Icon name={icon} fontSize="inherit" /> : null}
          {label}
          <Icon name="ExpandMore" fontSize="inherit" />
        </button>
      ) : (
        <IconButton icon={icon} label={label} onClick={(event) => setAnchorEl(event.currentTarget)} />
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {items.map((item) =>
          item.href ? (
            <MenuItem key={item.key} component={Link} href={item.href} onClick={() => setAnchorEl(null)}>
              {item.icon ? (
                <ListItemIcon>
                  <Icon name={item.icon} />
                </ListItemIcon>
              ) : null}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              key={item.key}
              onClick={() => {
                setAnchorEl(null);
                item.onClick?.();
              }}
            >
              {item.icon ? (
                <ListItemIcon>
                  <Icon name={item.icon} />
                </ListItemIcon>
              ) : null}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ),
        )}
      </Menu>
    </>
  );
}

export default Modal;
