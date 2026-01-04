// Utility functions for AI doctor search

export interface MedicalCondition {
  keywords: string[];
  specializations: string[];
  urgency: 'low' | 'medium' | 'high';
  description: string;
}

export const MEDICAL_CONDITIONS: Record<string, MedicalCondition> = {
  // Cardiovascular
  'heart_problems': {
    keywords: ['heart', 'cardiac', 'chest pain', 'palpitations', 'arrhythmia', 'blood pressure'],
    specializations: ['Cardiology', 'Cardiovascular Medicine', 'Internal Medicine'],
    urgency: 'high',
    description: 'Heart and cardiovascular related issues'
  },
  
  // Respiratory
  'breathing_issues': {
    keywords: ['breathing', 'shortness of breath', 'cough', 'lung', 'asthma', 'respiratory'],
    specializations: ['Pulmonology', 'Respiratory Medicine', 'Internal Medicine'],
    urgency: 'medium',
    description: 'Breathing and lung related problems'
  },
  
  // Digestive
  'digestive_problems': {
    keywords: ['stomach', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'digestive'],
    specializations: ['Gastroenterology', 'Internal Medicine', 'Family Medicine'],
    urgency: 'medium',
    description: 'Digestive system and stomach issues'
  },
  
  // Neurological
  'neurological_issues': {
    keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'neurological', 'brain'],
    specializations: ['Neurology', 'Internal Medicine'],
    urgency: 'high',
    description: 'Brain and nervous system related problems'
  },
  
  // Musculoskeletal
  'bone_joint_problems': {
    keywords: ['back pain', 'joint pain', 'arthritis', 'bone', 'muscle', 'orthopedic'],
    specializations: ['Orthopedics', 'Rheumatology', 'Physical Medicine'],
    urgency: 'low',
    description: 'Bone, joint, and muscle related issues'
  },
  
  // Dermatological
  'skin_problems': {
    keywords: ['skin', 'rash', 'acne', 'eczema', 'dermatitis', 'itching'],
    specializations: ['Dermatology', 'Allergy and Immunology'],
    urgency: 'low',
    description: 'Skin and dermatological conditions'
  },
  
  // Mental Health
  'mental_health': {
    keywords: ['anxiety', 'depression', 'stress', 'mental health', 'mood', 'psychological'],
    specializations: ['Psychiatry', 'Psychology', 'Family Medicine'],
    urgency: 'medium',
    description: 'Mental health and psychological concerns'
  },
  
  // Pediatric
  'child_health': {
    keywords: ['child', 'baby', 'infant', 'pediatric', 'kid', 'toddler'],
    specializations: ['Pediatrics', 'Family Medicine'],
    urgency: 'medium',
    description: 'Child and infant health concerns'
  },
  
  // Women's Health
  'womens_health': {
    keywords: ['pregnancy', 'menstrual', 'gynecological', 'women', 'obstetric'],
    specializations: ['Gynecology', 'Obstetrics', 'Family Medicine'],
    urgency: 'medium',
    description: 'Women\'s health and reproductive concerns'
  },
  
  // Endocrine
  'hormonal_issues': {
    keywords: ['diabetes', 'thyroid', 'hormone', 'endocrine', 'metabolism'],
    specializations: ['Endocrinology', 'Internal Medicine'],
    urgency: 'medium',
    description: 'Hormonal and metabolic disorders'
  }
};

export function analyzeSymptoms(query: string): {
  matchedConditions: MedicalCondition[];
  urgency: 'low' | 'medium' | 'high';
  recommendedSpecializations: string[];
} {
  const lowerQuery = query.toLowerCase();
  const matchedConditions: MedicalCondition[] = [];
  const specializations = new Set<string>();
  
  // Find matching conditions
  Object.values(MEDICAL_CONDITIONS).forEach(condition => {
    const hasMatch = condition.keywords.some(keyword => 
      lowerQuery.includes(keyword.toLowerCase())
    );
    
    if (hasMatch) {
      matchedConditions.push(condition);
      condition.specializations.forEach(spec => specializations.add(spec));
    }
  });
  
  // Determine overall urgency
  const urgencyLevels = matchedConditions.map(c => c.urgency);
  let urgency: 'low' | 'medium' | 'high' = 'low';
  
  if (urgencyLevels.includes('high')) {
    urgency = 'high';
  } else if (urgencyLevels.includes('medium')) {
    urgency = 'medium';
  }
  
  return {
    matchedConditions,
    urgency,
    recommendedSpecializations: Array.from(specializations)
  };
}

export function generateSearchSuggestions(): string[] {
  return [
    "I have chest pain and difficulty breathing",
    "My child has fever and won't eat",
    "I'm experiencing severe headaches",
    "I have persistent back pain",
    "I need help managing my diabetes",
    "I have skin rash that won't go away",
    "I'm feeling anxious and stressed",
    "I have stomach pain and nausea",
    "I need a pregnancy checkup",
    "I have joint pain and stiffness"
  ];
}