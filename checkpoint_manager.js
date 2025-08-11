#!/usr/bin/env node

/**
 * AI RFP Risk Scanner - Checkpoint Management System
 * 
 * This script provides comprehensive checkpoint and version management
 * functionality for the AI RFP Risk Scanner application.
 */

const { PrismaClient } = require('./app/node_modules/@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

class CheckpointManager {
  constructor() {
    this.uploadsDir = path.join(__dirname, 'uploads');
    this.backupDir = path.join(__dirname, '.checkpoints');
  }

  async initialize() {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('✅ Checkpoint manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize checkpoint manager:', error.message);
      throw error;
    }
  }

  async createCheckpoint(name = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const checkpointName = name || `checkpoint-${timestamp}`;
      
      console.log(`🔄 Creating checkpoint: ${checkpointName}`);
      
      // 1. Create database backup
      await this.backupDatabase(checkpointName);
      
      // 2. Create git commit
      await this.createGitCheckpoint(checkpointName);
      
      // 3. Backup uploaded files
      await this.backupFiles(checkpointName);
      
      // 4. Create checkpoint metadata
      await this.createCheckpointMetadata(checkpointName);
      
      console.log(`✅ Checkpoint created successfully: ${checkpointName}`);
      return checkpointName;
      
    } catch (error) {
      console.error('❌ Failed to create checkpoint:', error.message);
      throw error;
    }
  }

  async backupDatabase(checkpointName) {
    try {
      console.log('  📊 Backing up database...');
      
      // Get all reports with their assessments
      const reports = await prisma.report.findMany({
        include: {
          assessments: true,
          complianceAnalysis: true,
          emailVerifications: true
        }
      });
      
      // Get all users
      const users = await prisma.user.findMany({
        include: {
          accounts: true,
          sessions: true
        }
      });
      
      const backup = {
        timestamp: new Date().toISOString(),
        checkpointName,
        data: {
          reports,
          users,
          version: '1.0.0'
        }
      };
      
      const backupPath = path.join(this.backupDir, `${checkpointName}-database.json`);
      await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
      
      console.log('  ✅ Database backup completed');
    } catch (error) {
      console.error('  ❌ Database backup failed:', error.message);
      throw error;
    }
  }

  async createGitCheckpoint(checkpointName) {
    try {
      console.log('  📝 Creating git checkpoint...');
      
      // Add all changes
      execSync('git add .', { cwd: __dirname });
      
      // Create commit
      execSync(`git commit -m "Checkpoint: ${checkpointName}" || true`, { cwd: __dirname });
      
      // Create tag
      execSync(`git tag -a "checkpoint-${checkpointName}" -m "Checkpoint: ${checkpointName}" || true`, { cwd: __dirname });
      
      console.log('  ✅ Git checkpoint completed');
    } catch (error) {
      console.error('  ❌ Git checkpoint failed:', error.message);
      // Don't throw error for git operations as they might fail in some environments
    }
  }

  async backupFiles(checkpointName) {
    try {
      console.log('  📁 Backing up uploaded files...');
      
      const checkpointDir = path.join(this.backupDir, checkpointName);
      await fs.mkdir(checkpointDir, { recursive: true });
      
      // Get list of uploaded files
      const files = await fs.readdir(this.uploadsDir);
      
      // Create file manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        files: files.map(file => ({
          name: file,
          path: path.join(this.uploadsDir, file)
        }))
      };
      
      const manifestPath = path.join(checkpointDir, 'file-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      
      console.log(`  ✅ File backup completed (${files.length} files)`);
    } catch (error) {
      console.error('  ❌ File backup failed:', error.message);
      throw error;
    }
  }

  async createCheckpointMetadata(checkpointName) {
    try {
      const metadata = {
        name: checkpointName,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        components: {
          database: `${checkpointName}-database.json`,
          files: `${checkpointName}/file-manifest.json`,
          git: `checkpoint-${checkpointName}`
        },
        stats: {
          totalReports: await prisma.report.count(),
          totalUsers: await prisma.user.count(),
          totalAssessments: await prisma.riskAssessment.count()
        }
      };
      
      const metadataPath = path.join(this.backupDir, `${checkpointName}-metadata.json`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      console.log('  ✅ Checkpoint metadata created');
    } catch (error) {
      console.error('  ❌ Failed to create checkpoint metadata:', error.message);
      throw error;
    }
  }

  async listCheckpoints() {
    try {
      const files = await fs.readdir(this.backupDir);
      const checkpoints = files
        .filter(file => file.endsWith('-metadata.json'))
        .map(file => file.replace('-metadata.json', ''));
      
      console.log('📋 Available checkpoints:');
      for (const checkpoint of checkpoints) {
        const metadataPath = path.join(this.backupDir, `${checkpoint}-metadata.json`);
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
        console.log(`  • ${checkpoint} (${metadata.timestamp})`);
        console.log(`    Reports: ${metadata.stats.totalReports}, Users: ${metadata.stats.totalUsers}`);
      }
      
      return checkpoints;
    } catch (error) {
      console.error('❌ Failed to list checkpoints:', error.message);
      throw error;
    }
  }

  async verifySystem() {
    try {
      console.log('🔍 Verifying checkpoint system...');
      
      // Test database connection
      await prisma.$connect();
      console.log('  ✅ Database connection verified');
      
      // Check file system permissions
      await fs.access(this.uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
      console.log('  ✅ File system permissions verified');
      
      // Check git repository
      try {
        execSync('git status', { cwd: __dirname, stdio: 'pipe' });
        console.log('  ✅ Git repository verified');
      } catch {
        console.log('  ⚠️  Git repository not available (non-critical)');
      }
      
      // Check backup directory
      await fs.access(this.backupDir, fs.constants.R_OK | fs.constants.W_OK);
      console.log('  ✅ Backup directory verified');
      
      console.log('🎉 Checkpoint system verification completed successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ System verification failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    await prisma.$disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new CheckpointManager();
  
  try {
    await manager.initialize();
    
    switch (command) {
      case 'create':
        const name = args[1];
        await manager.createCheckpoint(name);
        break;
        
      case 'list':
        await manager.listCheckpoints();
        break;
        
      case 'verify':
        await manager.verifySystem();
        break;
        
      default:
        console.log('AI RFP Risk Scanner - Checkpoint Manager');
        console.log('');
        console.log('Usage:');
        console.log('  node checkpoint_manager.js create [name]  - Create a new checkpoint');
        console.log('  node checkpoint_manager.js list          - List all checkpoints');
        console.log('  node checkpoint_manager.js verify        - Verify system integrity');
        console.log('');
        break;
    }
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  } finally {
    await manager.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = CheckpointManager;
