import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Levels | Admin Dashboard',
  description: 'View and manage classification levels',
};

export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
