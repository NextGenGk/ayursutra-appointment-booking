'use client';

import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorWithUser } from '@/types/database';
import { DoctorCard } from '@/components/doctor-card';

interface AISearchResult {
  doctor: DoctorWithUser;
  relevanceScore: number;
  matchReason: string;
  aiAnalysis?: string;
}

interface AISearchResponse {
  success: boolean;
  data?: AISearchResult[];
  error?: string;
  searchQuery?: string;
  summary?: string;
  totalFound?: number;
  searchMethod?: string;
}

interface AIDoctorSearchProps {
  onBookAppointment: (doctor: DoctorWithUser) => void;
}

export function AIDoctorSearch({ onBookAppointment }: AIDoctorSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSummary, setSearchSummary] = useState<string>('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/patient/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const result: AISearchResponse = await response.json();

      if (result.success && result.data) {
        setSearchResults(result.data);
        setSearchSummary(result.summary || '');
        setHasSearched(true);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
        setSearchSummary('');
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchSummary('');
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleQueries = [
    "I have chest pain and shortness of breath",
    "My child has fever and cough",
    "I need help with diabetes management",
    "I have skin rash and itching",
    "I'm experiencing anxiety and stress",
    "I have back pain and joint stiffness"
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Doctor Search
          </CardTitle>
          <CardDescription>
            Describe your symptoms or health concerns, and our AI will recommend the most suitable doctors for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g., I have heart problems, chest pain, difficulty breathing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-base"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Example Queries */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.slice(0, 3).map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(example)}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div>
          {searchResults.length > 0 ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  AI Analysis for: "{searchQuery}"
                </h3>
                {searchSummary && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>🤖 AI Insight:</strong> {searchSummary}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <h4 className="text-lg font-medium mb-4">
                Recommended Doctors ({searchResults.length} found)
              </h4>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <div key={result.doctor.did} className="relative">
                    <DoctorCard
                      doctor={result.doctor}
                      onBookAppointment={onBookAppointment}
                    />
                    {/* AI Match Badge */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs"
                      >
                        {Math.round(result.relevanceScore * 100)}% Match
                      </Badge>
                    </div>
                    {/* Match Reason */}
                    <Card className="mt-2 bg-purple-50 border-purple-200">
                      <CardContent className="p-3">
                        <p className="text-sm text-purple-800">
                          <strong>Why this doctor:</strong> {result.matchReason}
                        </p>
                        {result.aiAnalysis && (
                          <p className="text-xs text-purple-600 mt-1">
                            {result.aiAnalysis}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No doctors found matching your search. Try rephrasing your symptoms or health concerns.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}