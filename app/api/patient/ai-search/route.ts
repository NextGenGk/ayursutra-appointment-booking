import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { geminiSearch } from '@/lib/gemini-ai-search';

interface SearchRequest {
  query: string;
}

interface AISearchResult {
  doctor: any;
  relevanceScore: number;
  matchReason: string;
  aiAnalysis: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query } = body;
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServerClient();
    
    // Fetch doctors and users separately, then join manually
    // This avoids the foreign key relationship error
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select(`
        did,
        uid,
        specialization,
        qualification,
        registration_number,
        years_of_experience,
        consultation_fee,
        bio,
        clinic_name,
        city,
        state,
        languages,
        is_verified
      `);
    
    if (doctorsError) {
      console.error('Error fetching doctors:', doctorsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch doctors' },
        { status: 500 }
      );
    }
    
    if (!doctors || doctors.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        searchQuery: query,
        summary: 'No doctors available at the moment.'
      });
    }
    
    // Fetch all users who are doctors
    const doctorUids = doctors.map(d => d.uid);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('uid, name, email, profile_image_url, is_active')
      .in('uid', doctorUids)
      .eq('is_active', true);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      // Continue with empty users array if fetch fails
    }
    
    // Manually join doctors with their user data
    const doctorsWithUsers = doctors
      .map(doctor => {
        const user = users?.find(u => u.uid === doctor.uid);
        return user ? { ...doctor, user } : null;
      })
      .filter(d => d !== null); // Filter out doctors without active users
    
    // Log the first doctor to check field names
    if (doctorsWithUsers.length > 0) {
      console.log('Sample doctor fields:', Object.keys(doctorsWithUsers[0]));
      const firstDoctor: any = doctorsWithUsers[0];
      console.log('Specialization field value:', firstDoctor.specialization || firstDoctor.spelization || 'NOT FOUND');
    }
    
    const activeDoctors = doctorsWithUsers;
    
    if (activeDoctors.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        searchQuery: query,
        summary: 'No doctors available at the moment.'
      });
    }
    
    // Use Gemini AI to analyze query and search doctors
    const searchResults = await geminiSearch.searchDoctors(activeDoctors, query);
    
    // Generate AI summary for the search
    const summary = await geminiSearch.generateSearchSummary(query, searchResults);
    
    return NextResponse.json({
      success: true,
      data: searchResults,
      searchQuery: query,
      summary: summary,
      totalFound: searchResults.length,
      searchMethod: 'gemini_ai'
    });
    
  } catch (error) {
    console.error('Gemini AI search error:', error);
    return NextResponse.json(
      { success: false, error: 'AI search service temporarily unavailable' },
      { status: 500 }
    );
  }
}