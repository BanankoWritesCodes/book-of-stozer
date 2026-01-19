'use client';

import { useRouter } from 'next/navigation';
import SlotMachine from '@/components/SlotMachine';

export default function SlotPage() {
  const router = useRouter();
  
  // Inject back button into SlotMachine via CSS hack or wrapper
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          background: 'linear-gradient(180deg, #c62828, #8b0000)',
          border: '2px solid #ef5350',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ◀ MENU
      </button>
      <SlotMachine />
    </div>
  );
}
