interface ProgressBarProps {
  /** Value between 0 and 100 */
  value: number;
  /** Optional CSS class name for the outer container */
  className?: string;
  /** Optional CSS class name for the progress bar */
  barClassName?: string;
}

export function ProgressBar({ 
  value,
  className = '',
  barClassName = ''
}: ProgressBarProps) {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div 
      className={`h-4 bg-gray-200 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full bg-purple-600 transition-all duration-300 ${barClassName}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}