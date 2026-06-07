import { Suspense } from 'react';
import { PageSkeleton } from './PageSkeleton';

export const LazyLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
);
