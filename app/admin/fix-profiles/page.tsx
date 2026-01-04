'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Users, UserPlus } from 'lucide-react';

export default function FixProfilesPage() {
    const [isFixing, setIsFixing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runProfileFix = async () => {
        try {
            setIsFixing(true);
            setError(null);
            setResults(null);

            const response = await fetch('/api/admin/fix-profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Fix process failed');
            }

            setResults(data.results);
        } catch (err) {
            console.error('Fix error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsFixing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Fix Utility</h1>
                    <p className="text-gray-600">
                        This utility ensures all users have corresponding patient or doctor profiles.
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Fix User-Profile Relationships
                        </CardTitle>
                        <CardDescription>
                            This will check all users in the database and create missing patient or doctor profiles
                            based on their role. This fixes the issue where users exist but don't have corresponding
                            profile records.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-yellow-800">What this does:</h4>
                                        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                            <li>• Scans all users in the database</li>
                                            <li>• Creates missing patient profiles for users with role='patient'</li>
                                            <li>• Creates missing doctor profiles for users with role='doctor'</li>
                                            <li>• Ensures proper foreign key relationships</li>
                                            <li>• Fixes appointment display issues</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={runProfileFix}
                                disabled={isFixing}
                                className="w-full"
                                size="lg"
                            >
                                {isFixing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Fixing Profiles...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Run Profile Fix
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="mb-6 border-red-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">Error occurred:</h4>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {results && (
                    <Card className="border-green-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="w-5 h-5" />
                                Fix Process Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{results.usersProcessed}</div>
                                    <div className="text-sm text-blue-700">Users Processed</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{results.patientsCreated}</div>
                                    <div className="text-sm text-green-700">Patients Created</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{results.doctorsCreated}</div>
                                    <div className="text-sm text-purple-700">Doctors Created</div>
                                </div>
                            </div>

                            {results.errors && results.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-800 mb-2">Errors encountered:</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {results.errors.map((error: string, index: number) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-medium">✅ Profile fix completed successfully!</p>
                                <p className="text-green-700 text-sm mt-1">
                                    All users now have corresponding patient or doctor profiles. 
                                    Appointments should now display correctly in dashboards.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}