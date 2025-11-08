/**
 * Generate a unique referral code
 * Format: 6 uppercase alphanumeric characters
 * Example: ABC123, XYZ789
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Generate 6 character code
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Generate a unique referral code that doesn't exist in the database
 * @param {Function} checkExists - Function to check if code exists (returns Promise<boolean>)
 * @param {number} maxAttempts - Maximum attempts to generate unique code
 * @returns {Promise<string>} Unique referral code
 */
async function generateUniqueReferralCode(checkExists, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode();
    const exists = await checkExists(code);
    
    if (!exists) {
      return code;
    }
  }
  
  // If we can't generate a unique code after max attempts, append timestamp
  return generateReferralCode() + Date.now().toString().slice(-4);
}

module.exports = {
  generateReferralCode,
  generateUniqueReferralCode
};

