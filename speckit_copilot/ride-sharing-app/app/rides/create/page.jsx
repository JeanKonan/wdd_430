'use client';

import Link from 'next/link';

export default function CreateRidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a New Ride</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Coming soon - Create and post new rides</p>
        </div>
      </div>
    </div>
  );
}
