interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

export function LoadingSpinner({
  size = 'md',
  containerClassName = 'flex justify-center items-center h-screen',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={containerClassName}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-[#e6c78b] ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}
