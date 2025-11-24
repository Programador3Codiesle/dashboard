import Link from 'next/link';
import { Button } from '@/components/shared/atoms/Button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-indigo-600 mb-4">Bienvenido a Panel Pro</h1>
      <p className="text-gray-600 mb-6">Administra nómina, citas y garantías desde tu panel.</p>
      <Link href="/dashboard">
        <Button variant="primary">Ir al Dashboard</Button>
      </Link>
    </div>
  );
}
