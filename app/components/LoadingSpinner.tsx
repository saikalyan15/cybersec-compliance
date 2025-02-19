// components/LoadingSpinner.tsx
import Image from 'next/image';

export const LoadingSpinner = () => (
  <Image
    src="/Images/spinner-bg.svg"
    alt="Loading..."
    width={20}
    height={20}
    className="animate-spin h-5 w-5 mr-2"
  />
);
