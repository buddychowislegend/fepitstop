const db = require('../config/db');

async function createCompanyTables() {
  try {
    console.log('Creating company-related tables...');

    // Create candidates table
    await db.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        profile VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company_email (company_id, email),
        INDEX idx_company_id (company_id)
      )
    `);

    // Create interview_drives table
    await db.query(`
      CREATE TABLE IF NOT EXISTS interview_drives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        INDEX idx_company_id (company_id)
      )
    `);

    // Create drive_candidates junction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS drive_candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        drive_id INT NOT NULL,
        candidate_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drive_id) REFERENCES interview_drives(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        UNIQUE KEY unique_drive_candidate (drive_id, candidate_id)
      )
    `);

    // Create interview_tokens table
    await db.query(`
      CREATE TABLE IF NOT EXISTS interview_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        drive_id INT NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (drive_id) REFERENCES interview_drives(id) ON DELETE CASCADE,
        INDEX idx_token (token)
      )
    `);

    // Create interview_responses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS interview_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        drive_id INT NOT NULL,
        answers JSON NOT NULL,
        score DECIMAL(5,2) NULL,
        feedback TEXT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (drive_id) REFERENCES interview_drives(id) ON DELETE CASCADE,
        INDEX idx_candidate_drive (candidate_id, drive_id)
      )
    `);

    // Create companies table (for future expansion)
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Company tables created successfully!');
    
    // Insert sample company data
    await db.query(`
      INSERT IGNORE INTO companies (company_id, name, email) 
      VALUES ('hireog', 'HireOG', 'admin@hireog.com')
    `);

    console.log('✅ Sample company data inserted!');

  } catch (error) {
    console.error('❌ Error creating company tables:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createCompanyTables()
    .then(() => {
      console.log('Company tables setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = createCompanyTables;
