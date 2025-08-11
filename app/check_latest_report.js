const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLatestReport() {
  try {
    console.log('🔍 Checking latest reports...');
    
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        assessments: true
      }
    });
    
    console.log(`📊 Found ${reports.length} reports:\n`);
    
    reports.forEach((report, index) => {
      console.log(`${index + 1}. Report ID: ${report.id}`);
      console.log(`   File: ${report.fileName}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Score: ${report.overallRiskScore}/25`);
      console.log(`   Level: ${report.overallRiskLevel}`);
      console.log(`   Assessments: ${report.assessments.length}`);
      console.log(`   Created: ${report.createdAt}`);
      
      if (report.assessments.length > 0) {
        console.log(`   Sample Assessment Scores:`);
        report.assessments.slice(0, 3).forEach((assessment, i) => {
          console.log(`     ${i + 1}. ${assessment.subcategoryName}: ${assessment.riskScore}/25 (L:${assessment.likelihoodScore} × I:${assessment.impactScore})`);
        });
      }
      console.log('');
    });
    
    // Focus on the latest report
    if (reports.length > 0) {
      const latest = reports[0];
      console.log('🎯 LATEST REPORT DETAILED ANALYSIS:');
      console.log(`   ID: ${latest.id}`);
      console.log(`   Status: ${latest.status}`);
      console.log(`   Overall Score: ${latest.overallRiskScore}`);
      console.log(`   Individual Scores: ${latest.assessments.map(a => a.riskScore).join(', ')}`);
      
      // Check if this is a FRESH analysis (created very recently)
      const ageMinutes = (Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60);
      if (ageMinutes < 10) {
        console.log(`   🆕 This is a FRESH analysis (${Math.round(ageMinutes)} minutes old)`);
        
        if (latest.overallRiskScore > 0) {
          console.log('   ✅ SCORING WORKS FOR NEW REPORTS! Score properly calculated.');
        } else {
          console.log('   ❌ SCORING STILL BROKEN FOR NEW REPORTS! Score is 0.');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestReport();