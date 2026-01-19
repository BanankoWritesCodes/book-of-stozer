'use client';

import { useRouter } from 'next/navigation';
import CaseOpening from '@/components/CaseOpening';

export default function CasesPage() {
  const router = useRouter();
  return <CaseOpening onBack={() => router.push('/')} />;
}
