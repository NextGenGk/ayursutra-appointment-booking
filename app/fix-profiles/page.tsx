'use client';

import { useState } from 'react';

export default function FixProfilesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixProfiles = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/admin/fix-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to fix profiles');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Fix profiles error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Fix User Profiles</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-blue-800 mb-2">What this does:</h2>
        <p className="text-blue-700 text-sm">
          This tool finds users in the database who don't have corresponding patient or doctor profiles 
          and creates the missing profiles automatically.
        </p>
      </div>

      <button
        onClick={handleFixProfiles}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium"
      >
        {isLoading ? 'Fixing Profiles...' : 'Fix Profiles'}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {results && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3">Results:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Users Processed:</strong> {results.usersProcessed}</p>
            <p><strong>Patients Created:</strong> {results.patientsCreated}</p>
            <p><strong>Doctors Created:</strong> {results.doctorsCreated}</p>
            
            {results.errors.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-red-700">Errors:</p>
                <ul className="list-disc list-inside text-red-600">
                  {results.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}