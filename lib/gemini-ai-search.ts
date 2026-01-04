import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface DoctorSearchResult {
  doctor: any;
  relevanceScore: number;
  matchReason: string;
  aiAnalysis: string;
}

export interface GeminiAnalysis {
  specializations: string[];
  urgency: 'low' | 'medium' | 'high';
  symptoms: string[];
  medicalConditions: string[];
  recommendedActions: string[];
  confidence: number;
}

export class GeminiDoctorSearch {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeQuery(query: string): Promise<GeminiAnalysis> {
    try {
      const prompt = `
You are a medical AI assistant. Analyze the following patient query and provide a structured response.

Patient Query: "${query}"

Please analyze this query and respond with a JSON object containing:
{
  "specializations": ["list of relevant medical specializations"],
  "urgency": "low|medium|high",
  "symptoms": ["extracted symptoms"],
  "medicalConditions": ["possible conditions"],
  "recommendedActions": ["what the patient should do"],
  "confidence": 0.0-1.0
}

Medical Specializations to consider:
- Cardiology (heart, chest pain, blood pressure, cardiac issues)
- Pulmonology (breathing, lung, cough, asthma, respiratory)
- Dermatology (skin, rash, acne, eczema, dermatitis)
- Gastroenterology (stomach, digestive, abdominal pain, nausea)
- Neurology (headache, migraine, seizure, neurological, brain)
- Orthopedics (bone, joint, back pain, fracture, arthritis)
- Pediatrics (child, baby, infant, pediatric)
- Psychiatry (anxiety, depression, stress, mental health)
- Gynecology (women's health, pregnancy, menstrual)
- Endocrinology (diabetes, thyroid, hormone, metabolism)
- Urology (kidney, urinary, bladder)
- Ophthalmology (eye, vision, sight)
- ENT (ear, nose, throat, hearing)
- Emergency Medicine (severe, acute, urgent symptoms)
- Internal Medicine (general health, fever, fatigue)
- Family Medicine (general practice, routine care)

Urgency Levels:
- high: severe symptoms, emergency situations, acute conditions
- medium: persistent symptoms, chronic conditions, specialist needed
- low: mild symptoms, routine checkups, preventive care

Respond only with valid JSON.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response (handle markdown code blocks)
      let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        jsonMatch = text.match(/\{[\s\S]*\}/);
      }
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      
      // Validate and set defaults
      return {
        specializations: analysis.specializations || [],
        urgency: analysis.urgency || 'medium',
        symptoms: analysis.symptoms || [],
        medicalConditions: analysis.medicalConditions || [],
        recommendedActions: analysis.recommendedActions || [],
        confidence: analysis.confidence || 0.7
      };
      
    } catch (error) {
      console.error('Gemini analysis error:', error);
      
      // Fallback to basic keyword matching
      return this.fallbackAnalysis(query);
    }
  }

  private fallbackAnalysis(query: string): GeminiAnalysis {
    const lowerQuery = query.toLowerCase();
    const specializations: string[] = [];
    const symptoms: string[] = [];
    
    // Basic keyword matching as fallback
    const keywordMap = {
      'heart|cardiac|chest pain': 'Cardiology',
      'breathing|lung|cough': 'Pulmonology',
      'skin|rash|acne': 'Dermatology',
      'stomach|digestive|abdominal': 'Gastroenterology',
      'headache|migraine': 'Neurology',
      'back pain|joint|bone': 'Orthopedics',
      'child|baby|infant': 'Pediatrics',
      'anxiety|depression|stress': 'Psychiatry',
      'diabetes|thyroid': 'Endocrinology',
      'fever|fatigue': 'Internal Medicine'
    };
    
    Object.entries(keywordMap).forEach(([keywords, specialization]) => {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(query)) {
        specializations.push(specialization);
        symptoms.push(...keywords.split('|').filter(k => lowerQuery.includes(k)));
      }
    });
    
    const urgency = lowerQuery.includes('severe') || lowerQuery.includes('acute') || lowerQuery.includes('emergency') 
      ? 'high' : lowerQuery.includes('chronic') || lowerQuery.includes('persistent') 
      ? 'medium' : 'low';
    
    return {
      specializations,
      urgency,
      symptoms,
      medicalConditions: [],
      recommendedActions: ['Consult with a relevant specialist'],
      confidence: 0.6
    };
  }

  async searchDoctors(doctors: any[], query: string): Promise<DoctorSearchResult[]> {
    try {
      // Get AI analysis of the query
      const analysis = await this.analyzeQuery(query);
      
      console.log('AI Analysis:', {
        specializations: analysis.specializations,
        urgency: analysis.urgency,
        symptoms: analysis.symptoms,
        confidence: analysis.confidence
      });
      
      // Score and rank doctors
      const scoredDoctors = doctors.map(doctor => {
        const doctorSpec = this.getDoctorSpecialization(doctor);
        const score = this.calculateRelevanceScore(doctor, analysis);
        const matchReason = this.generateMatchReason(doctor, analysis);
        
        console.log(`Doctor: ${doctor.user?.name || 'Unknown'} | Spec: ${doctorSpec || 'None'} | Score: ${score.toFixed(2)}`);
        
        return {
          doctor,
          relevanceScore: score,
          matchReason,
          aiAnalysis: `AI Confidence: ${Math.round(analysis.confidence * 100)}% | Urgency: ${analysis.urgency}`
        };
      });
      
      // Filter and sort results
      const results = scoredDoctors
        .filter(result => result.relevanceScore > 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);
      
      console.log(`Filtered ${results.length} doctors out of ${doctors.length} total`);
      
      return results;
        
    } catch (error) {
      console.error('Gemini search error:', error);
      throw error;
    }
  }

  // Helper method to safely get specialization from doctor object
  // Handles both correct spelling and potential database typos
  private getDoctorSpecialization(doctor: any): string {
    // Check for correct spelling first
    if (doctor.specialization) {
      return doctor.specialization;
    }
    // Check for common typos
    if (doctor.spelization) {
      return doctor.spelization;
    }
    // Fallback to empty string
    return '';
  }

  private calculateRelevanceScore(doctor: any, analysis: GeminiAnalysis): number {
    let score = 0.2; // Base score
    
    const doctorSpec = this.getDoctorSpecialization(doctor)?.toLowerCase() || '';
    
    // Specialization matching (60% weight)
    if (analysis.specializations.length > 0) {
      const hasDirectMatch = analysis.specializations.some(spec => 
        doctorSpec.includes(spec.toLowerCase()) || 
        spec.toLowerCase().includes(doctorSpec)
      );
      
      if (hasDirectMatch) {
        score += 0.6;
      } else {
        // Check for related specializations
        const generalSpecs = ['internal medicine', 'family medicine', 'general practice'];
        if (generalSpecs.some(spec => doctorSpec.includes(spec))) {
          score += 0.3;
        }
      }
    }
    
    // Experience bonus (20% weight)
    const experience = doctor.years_of_experience || 0;
    if (experience >= 15) score += 0.2;
    else if (experience >= 10) score += 0.15;
    else if (experience >= 5) score += 0.1;
    else if (experience >= 2) score += 0.05;
    
    // Verification bonus (10% weight)
    if (doctor.is_verified) {
      score += 0.1;
    }
    
    // AI confidence bonus (10% weight)
    score += analysis.confidence * 0.1;
    
    return Math.min(score, 1.0);
  }

  private generateMatchReason(doctor: any, analysis: GeminiAnalysis): string {
    const reasons: string[] = [];
    const doctorSpec = this.getDoctorSpecialization(doctor) || 'General Practice';
    const experience = doctor.years_of_experience || 0;
    
    // Specialization relevance
    const hasDirectMatch = analysis.specializations.some(spec => 
      doctorSpec.toLowerCase().includes(spec.toLowerCase()) || 
      spec.toLowerCase().includes(doctorSpec.toLowerCase())
    );
    
    if (hasDirectMatch) {
      reasons.push(`Specializes in ${doctorSpec}, directly relevant to your ${analysis.symptoms.join(', ')} concerns`);
    } else {
      reasons.push(`${doctorSpec} specialist who can help with your health concerns`);
    }
    
    // Experience
    if (experience >= 15) {
      reasons.push(`${experience}+ years of extensive experience`);
    } else if (experience >= 10) {
      reasons.push(`${experience}+ years of experience`);
    } else if (experience >= 5) {
      reasons.push(`${experience} years of experience`);
    }
    
    // Verification
    if (doctor.is_verified) {
      reasons.push('verified medical professional');
    }
    
    // AI recommendations
    if (analysis.recommendedActions.length > 0) {
      const action = analysis.recommendedActions[0];
      if (action.toLowerCase().includes('specialist')) {
        reasons.push('recommended by AI for your specific symptoms');
      }
    }
    
    return reasons.join(', ');
  }

  async generateSearchSummary(query: string, results: DoctorSearchResult[]): Promise<string> {
    try {
      const prompt = `
Based on the patient query "${query}" and ${results.length} doctor matches found, provide a brief, helpful summary for the patient.

Include:
1. What type of medical concern this appears to be
2. Why these doctors are good matches
3. Any general advice (without providing medical diagnosis)

Keep it under 100 words and patient-friendly.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
      
    } catch (error) {
      console.error('Summary generation error:', error);
      return `Found ${results.length} relevant doctors for your "${query}" concern. These specialists have been matched based on their expertise and experience in treating similar conditions.`;
    }
  }
}

export const geminiSearch = new GeminiDoctorSearch();