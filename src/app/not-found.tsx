import Link from 'next/link';
import { Leaf, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pcfi-green-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pcfi-gold-500 rounded-2xl mb-6">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-6xl font-bold text-white mb-3">404</h1>
        <p className="text-pcfi-green-200 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-gold inline-flex">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}