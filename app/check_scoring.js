const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkScoring() {
  try {
    console.log('🔍 Checking recent reports and their scoring...');
    
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        assessments: true
      }
    });
    
    for (const report of reports) {
      console.log(`\n📊 Report: ${report.fileName}`);
      console.log(`   Overall Score: ${report.overallRiskScore}/25`);
      console.log(`   Overall Level: ${report.overallRiskLevel}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Assessments: ${report.assessments.length}`);
      
      if (report.assessments.length > 0) {
        const riskLevelCounts = report.assessments.reduce((acc, assessment) => {
          acc[assessment.riskLevel] = (acc[assessment.riskLevel] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`   Risk Distribution:`, riskLevelCounts);
        
        // Check individual risk scores
        const sampleAssessments = report.assessments.slice(0, 3);
        console.log(`   Sample Risk Scores:`);
        for (const assessment of sampleAssessments) {
          console.log(`     - ${assessment.subcategoryName}: ${assessment.riskScore} (${assessment.riskLevel})`);
          console.log(`       Likelihood: ${assessment.likelihoodScore}, Impact: ${assessment.impactScore}`);
        }
        
        // Manual calculation
        const totalRiskScore = report.assessments.reduce((sum, a) => sum + a.riskScore, 0);
        const avgRiskScore = Math.round((totalRiskScore / report.assessments.length) * 10) / 10;
        console.log(`   Calculated Average: ${avgRiskScore}/25`);
      }
    }
    
  } catch (error) {
    console.error('Error checking scoring:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScoring();
