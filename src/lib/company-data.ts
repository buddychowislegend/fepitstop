// Global data store that persists across requests in the same instance
declare global {
  var __companyData: {
    candidates: any[];
    interviewDrives: any[];
    interviewTokens: any[];
  } | undefined;
}

// Initialize global data store if it doesn't exist
if (!global.__companyData) {
  global.__companyData = {
    candidates: [],
    interviewDrives: [],
    interviewTokens: []
  };
}

// Use the global data store
export const companyData = global.__companyData;

// Helper functions for data management
export const addCandidate = (candidate: any) => {
  companyData.candidates.push(candidate);
  return candidate;
};

export const getCandidatesByCompany = (companyId: string) => {
  return companyData.candidates.filter((c: any) => c.companyId === companyId);
};

export const addInterviewDrive = (drive: any) => {
  companyData.interviewDrives.push(drive);
  return drive;
};

export const getDrivesByCompany = (companyId: string) => {
  return companyData.interviewDrives.filter((d: any) => d.companyId === companyId);
};

export const addInterviewToken = (token: any) => {
  companyData.interviewTokens.push(token);
  return token;
};

export const getTokenData = (token: string) => {
  return companyData.interviewTokens.find((t: any) => t.token === token);
};

export const updateToken = (token: string, updates: any) => {
  const tokenIndex = companyData.interviewTokens.findIndex((t: any) => t.token === token);
  if (tokenIndex !== -1) {
    companyData.interviewTokens[tokenIndex] = { ...companyData.interviewTokens[tokenIndex], ...updates };
    return companyData.interviewTokens[tokenIndex];
  }
  return null;
};

// Debug function to get all data
export const getAllData = () => {
  return companyData;
};

// Debug function to log current state
export const logDataState = (label: string) => {
  console.log(`${label} - Current data state:`, {
    candidates: companyData.candidates.length,
    drives: companyData.interviewDrives.length,
    tokens: companyData.interviewTokens.length,
    candidates: companyData.candidates
  });
};
