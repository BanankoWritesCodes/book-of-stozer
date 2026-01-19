'use client';

import { useRouter } from 'next/navigation';
import Roulette from '@/components/Roulette';

export default function RoulettePage() {
  const router = useRouter();
  return <Roulette onBack={() => router.push('/')} />;
}
