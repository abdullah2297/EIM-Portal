'use client';

import { Icon } from './Icon';
import { Button } from './Button';

/**
 * The four data states every list and detail screen must handle.
 * `DataState` picks the right one so pages stay declarative.
 */

/** @param {{ label?: string }} props */
export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="loading-inline" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** @param {{ count?: number, className?: string }} props */
export function SkeletonGrid({ count = 6, className = 'grid-auto' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="skeleton-card" key={index}>
          <span className="skeleton skeleton--avatar" />
          <span className="skeleton skeleton--title" />
          <span className="skeleton skeleton--text" />
          <span className="skeleton skeleton--text" />
          <span className="skeleton skeleton--text" />
        </div>
      ))}
    </div>
  );
}

/** @param {{ title?: string, message?: string, onRetry?: () => void }} props */
export function ErrorState({
  title = 'We could not load this content',
  message = 'Something went wrong on our side. Please try again in a moment.',
  onRetry,
}) {
  return (
    <div className="state-panel" role="alert">
      <span className="state-panel__icon state-panel__icon--error">
        <Icon name="ErrorOutline" fontSize="large" />
      </span>
      <h3 className="state-panel__title">{title}</h3>
      <p className="state-panel__text">{message}</p>
      {onRetry ? (
        <Button variant="outline" icon="Refresh" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/**
 * @param {{
 *  title?: string,
 *  message?: string,
 *  icon?: string,
 *  actionLabel?: string,
 *  onAction?: () => void,
 *  actionHref?: string,
 * }} props
 */
export function EmptyState({
  title = 'Nothing to show yet',
  message = 'There is no content here at the moment. Check back soon.',
  icon = 'SearchOff',
  actionLabel,
  onAction,
  actionHref,
}) {
  return (
    <div className="state-panel">
      <span className="state-panel__icon">
        <Icon name={icon} fontSize="large" />
      </span>
      <h3 className="state-panel__title">{title}</h3>
      <p className="state-panel__text">{message}</p>
      {actionLabel && (onAction || actionHref) ? (
        <Button variant="outline" onClick={onAction} href={actionHref}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Declarative state switch.
 *
 * @param {{
 *  isLoading: boolean,
 *  error?: Error | null,
 *  isEmpty?: boolean,
 *  onRetry?: () => void,
 *  skeletonCount?: number,
 *  skeletonClassName?: string,
 *  emptyProps?: object,
 *  children: import('react').ReactNode,
 * }} props
 */
export function DataState({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  skeletonCount = 6,
  skeletonClassName,
  emptyProps,
  children,
}) {
  if (isLoading) return <SkeletonGrid count={skeletonCount} className={skeletonClassName} />;
  if (error) {
    return (
      <ErrorState
        message={
          error?.isNetworkError
            ? 'We could not reach the server. Check your connection and try again.'
            : error?.message
        }
        onRetry={onRetry}
      />
    );
  }
  if (isEmpty) return <EmptyState {...emptyProps} />;
  return children;
}

export default DataState;
