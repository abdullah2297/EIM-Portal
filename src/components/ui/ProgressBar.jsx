/**
 * Labelled progress meter, used for competition timelines and skill levels.
 *
 * The fill width is expressed through a generated `--{n}` class (5% steps)
 * rather than an inline style, so all styling stays in the stylesheet.
 *
 * @param {{ value: number, label?: string, valueLabel?: string, tone?: 'accent'|'gold', className?: string }} props
 */
export function ProgressBar({ value, label, valueLabel, tone = 'accent', className = '' }) {
  const safe = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
  const step = Math.round(safe / 5) * 5;

  return (
    <div className={`u-stack u-stack--sm ${className}`.trim()}>
      {label || valueLabel ? (
        <div className="u-cluster justify-between u-text-xs u-muted">
          {label ? <span>{label}</span> : <span />}
          {valueLabel ? <span>{valueLabel}</span> : null}
        </div>
      ) : null}
      <div
        className={`progress-track ${tone === 'gold' ? 'progress-track--gold' : ''}`.trim()}
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className={`progress-track__fill progress-track__fill--${step}`} />
      </div>
    </div>
  );
}

export default ProgressBar;
