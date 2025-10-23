"use client";
import { useState, useEffect } from "react";

interface ScreeningDetails {
  positionTitle: string;
  language: string;
  mustHaves: string[];
  goodToHaves: string[];
  culturalFit: string[];
  estimatedTime: {
    mustHaves: number;
    goodToHaves: number;
    culturalFit: number;
  };
}

interface AIConfigurationScreenProps {
  aiPrompt: string;
  onBack: () => void;
  onCreateDrive: (details: ScreeningDetails) => void;
}

const languages = [
  { code: 'en-us', name: 'US English', flag: '🇺🇸' },
  { code: 'en-uk', name: 'UK English', flag: '🇬🇧' },
  { code: 'en-au', name: 'Australia English', flag: '🇦🇺' },
  { code: 'en-in', name: 'India English', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
];

export default function AIConfigurationScreen({ aiPrompt, onBack, onCreateDrive }: AIConfigurationScreenProps) {
  const [screeningDetails, setScreeningDetails] = useState<ScreeningDetails>({
    positionTitle: '',
    language: 'en-us',
    mustHaves: [],
    goodToHaves: [],
    culturalFit: [],
    estimatedTime: {
      mustHaves: 0,
      goodToHaves: 0,
      culturalFit: 0
    }
  });
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    generateScreeningDetails();
  }, [aiPrompt]);

  const generateScreeningDetails = async () => {
    try {
      setIsGenerating(true);
      
      // Call AI API to generate screening details
      const response = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a comprehensive screening assessment for: ${aiPrompt}. 
          Please provide:
          1. Position title
          2. Must-have technical skills (3-5 items)
          3. Good-to-have skills (3-5 items) 
          4. Cultural fit attributes (2-3 items)
          5. Estimated time for each section
          
          Format as JSON with this structure:
          {
            "positionTitle": "string",
            "mustHaves": ["skill1", "skill2", "skill3"],
            "goodToHaves": ["skill1", "skill2", "skill3"],
            "culturalFit": ["attribute1", "attribute2"],
            "estimatedTime": {
              "mustHaves": 4,
              "goodToHaves": 2,
              "culturalFit": 2
            }
          }`
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        let generatedDetails;
        try {
          // Parse the response as JSON
          generatedDetails = JSON.parse(data.response || '{}');
        } catch (parseError) {
          console.error('Failed to parse API response as JSON:', parseError);
          // If parsing fails, try to use the response directly
          generatedDetails = data.response || {};
        }
        
        setScreeningDetails({
          positionTitle: generatedDetails.positionTitle || extractPositionFromPrompt(),
          language: 'en-us',
          mustHaves: generatedDetails.mustHaves || getDefaultMustHaves(),
          goodToHaves: generatedDetails.goodToHaves || getDefaultGoodToHaves(),
          culturalFit: generatedDetails.culturalFit || getDefaultCulturalFit(),
          estimatedTime: generatedDetails.estimatedTime || {
            mustHaves: 4,
            goodToHaves: 2,
            culturalFit: 2
          }
        });
      } else {
        // Fallback to default values
        setScreeningDetails({
          positionTitle: extractPositionFromPrompt(),
          language: 'en-us',
          mustHaves: getDefaultMustHaves(),
          goodToHaves: getDefaultGoodToHaves(),
          culturalFit: getDefaultCulturalFit(),
          estimatedTime: {
            mustHaves: 4,
            goodToHaves: 2,
            culturalFit: 2
          }
        });
      }
    } catch (error) {
      console.error('Error generating screening details:', error);
      // Fallback to default values
      setScreeningDetails({
        positionTitle: extractPositionFromPrompt(),
        language: 'en-us',
        mustHaves: getDefaultMustHaves(),
        goodToHaves: getDefaultGoodToHaves(),
        culturalFit: getDefaultCulturalFit(),
        estimatedTime: {
          mustHaves: 4,
          goodToHaves: 2,
          culturalFit: 2
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const extractPositionFromPrompt = () => {
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('backend')) return 'Backend Developer';
    if (lowerPrompt.includes('frontend')) return 'Frontend Developer';
    if (lowerPrompt.includes('full stack')) return 'Full Stack Developer';
    if (lowerPrompt.includes('devops')) return 'DevOps Engineer';
    if (lowerPrompt.includes('mobile')) return 'Mobile Developer';
    if (lowerPrompt.includes('product')) return 'Product Manager';
    return 'Software Engineer';
  };

  const getDefaultMustHaves = () => {
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('backend')) {
      return [
        '5+ years backend development experience',
        'Proficient in Python or Java',
        'RESTful API development expertise',
        'Database design and optimization',
        'Version control with Git'
      ];
    }
    if (lowerPrompt.includes('frontend')) {
      return [
        '5+ years frontend development experience',
        'Proficient in React or Vue.js',
        'JavaScript ES6+ expertise',
        'CSS/SCSS and responsive design',
        'Version control with Git'
      ];
    }
    return [
      '5+ years software development experience',
      'Strong programming fundamentals',
      'Problem-solving skills',
      'Version control with Git',
      'Agile development experience'
    ];
  };

  const getDefaultGoodToHaves = () => {
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('backend')) {
      return [
        'Experience with Docker/Kubernetes',
        'Familiarity with SQL and NoSQL databases',
        'Knowledge of microservices architecture',
        'Cloud platform experience (AWS/Azure/GCP)',
        'CI/CD pipeline experience'
      ];
    }
    if (lowerPrompt.includes('frontend')) {
      return [
        'Experience with state management (Redux/Vuex)',
        'Testing frameworks (Jest/Cypress)',
        'Build tools (Webpack/Vite)',
        'TypeScript experience',
        'Performance optimization skills'
      ];
    }
    return [
      'Cloud platform experience',
      'Containerization knowledge',
      'Testing frameworks experience',
      'Performance optimization',
      'Security best practices'
    ];
  };

  const getDefaultCulturalFit = () => {
    return [
      'Strong communication skills',
      'Willingness to mentor junior developers',
      'Collaborative team player',
      'Adaptability to new technologies',
      'Problem-solving mindset'
    ];
  };

  const handleCreateDrive = async () => {
    setIsCreating(true);
    try {
      await onCreateDrive(screeningDetails);
    } finally {
      setIsCreating(false);
    }
  };

  const addRequirement = (section: 'mustHaves' | 'goodToHaves' | 'culturalFit') => {
    const newRequirement = prompt(`Add a new ${section.replace(/([A-Z])/g, ' $1').toLowerCase()} requirement:`);
    if (newRequirement && newRequirement.trim()) {
      setScreeningDetails(prev => ({
        ...prev,
        [section]: [...prev[section], newRequirement.trim()]
      }));
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating AI Screening</h2>
          <p className="text-gray-600">Creating your personalized screening assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Screening Configuration</h1>
          </div>
          <p className="text-gray-600">Review and modify the screening details</p>
        </div>

        {/* Position Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Position Title</label>
          <input
            type="text"
            value={screeningDetails.positionTitle}
            onChange={(e) => setScreeningDetails(prev => ({ ...prev, positionTitle: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter position title"
          />
        </div>

        {/* Interview Language & Accent */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-3">Interview Language & Accent</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setScreeningDetails(prev => ({ ...prev, language: lang.code }))}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  screeningDetails.language === lang.code
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Must Haves */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Must Haves</h3>
            </div>
            <span className="text-sm text-gray-500">{screeningDetails.estimatedTime.mustHaves} min</span>
          </div>
          <ul className="space-y-2 mb-4">
            {screeningDetails.mustHaves.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => addRequirement('mustHaves')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add more
          </button>
        </div>

        {/* Good to Haves */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Good to Haves</h3>
            </div>
            <span className="text-sm text-gray-500">{screeningDetails.estimatedTime.goodToHaves} min</span>
          </div>
          <ul className="space-y-2 mb-4">
            {screeningDetails.goodToHaves.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => addRequirement('goodToHaves')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            + Add more
          </button>
        </div>

        {/* Cultural Fit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cultural Fit</h3>
            </div>
            <span className="text-sm text-gray-500">{screeningDetails.estimatedTime.culturalFit} min</span>
          </div>
          <ul className="space-y-2 mb-4">
            {screeningDetails.culturalFit.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => addRequirement('culturalFit')}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            + Add more
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCreateDrive}
            disabled={isCreating}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Creating Drive...
              </>
            ) : (
              'Create Drive'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
