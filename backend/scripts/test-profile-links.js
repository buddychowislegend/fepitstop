#!/usr/bin/env node

/**
 * Quick test utility: generates sample interview links for multiple profiles
 * and shows how our profile mapping + focus/framework selection behave.
 *
 * Usage: node backend/scripts/test-profile-links.js
 */

const PROFILE_FOCUS_MAP = {
  frontend: 'fullstack',
  backend: 'backend_architecture',
  product: 'product_strategy',
  business: 'business_development',
  qa: 'quality_assurance',
  hr: 'hr_processes',
  data: 'data_analytics'
};

const PROFILE_FRAMEWORK_MAP = {
  frontend: 'react',
  backend: 'spring_boot',
  product: 'product_management',
  business: 'business_strategy',
  qa: 'qa_automation',
  hr: 'hr_operations',
  data: 'data_tooling'
};

function mapProfileString(value = '') {
  const lower = value.toLowerCase();
  if (lower.includes('back')) return 'backend';
  if (lower.includes('product')) return 'product';
  if (lower.includes('hr') || lower.includes('human')) return 'hr';
  if (lower.includes('business') || lower.includes('sales')) return 'business';
  if (lower.includes('qa') || lower.includes('quality') || lower.includes('test')) return 'qa';
  if (lower.includes('data') || lower.includes('analyt')) return 'data';
  return 'frontend';
}

const PROFILES_TO_TEST = [
  'Frontend Engineer',
  'Frontend (React Specialist)',
  'Backend Engineer - Java',
  'Fullstack Developer',
  'Product Manager',
  'Product Lead (AI)',
  'Business Development Manager',
  'QA Automation Engineer',
  'HR Business Partner',
  'Data Analyst',
  'Senior Data Scientist'
];

const BASE_URL = 'https://hireog.com/hiring/candidate-interview/test-token';
const COMPANY = 'HireOG';
const LEVEL = 'mid';

console.log('🧪 Generating sample interview links for various profiles...\n');

PROFILES_TO_TEST.forEach((label, index) => {
  const mappedProfile = mapProfileString(label);
  const focus = PROFILE_FOCUS_MAP[mappedProfile] || 'fullstack';
  const framework = PROFILE_FRAMEWORK_MAP[mappedProfile] || 'general';

  const qs = new URLSearchParams({
    company: COMPANY,
    profile: label,
    level: LEVEL,
    candidateName: `Candidate${index + 1}`,
    candidateEmail: `candidate${index + 1}@example.com`
  });

  const link = `${BASE_URL}?${qs.toString()}`;

  console.log(`Profile Label: ${label}`);
  console.log(` → Mapped Profile: ${mappedProfile}`);
  console.log(` → Focus Area:    ${focus}`);
  console.log(` → Framework:     ${framework}`);
  console.log(` → Interview Link: ${link}`);
  console.log('');
});

console.log('✅ Done. Review the mappings above to ensure each profile routes to the expected focus areas.\n');
