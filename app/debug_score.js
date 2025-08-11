
const { PrismaClient } = require('@prisma/client');

async function debugScoring() {
  const prisma = new PrismaClient();
  
  try {
    // Get recent reports with their risk assessments
    const reports = await prisma.report.findMany({
      include: {
        assessments: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    console.log('\n🔍 DEBUG: Recent Reports Analysis\n');
    
    for (const report of reports) {
      console.log(`📊 Report: ${report.fileName}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Overall Risk Score: ${report.overallRiskScore}`);
      console.log(`   Overall Risk Level: ${report.overallRiskLevel}`);
      console.log(`   Risk Assessments Count: ${report.assessments.length}`);
      
      if (report.assessments.length > 0) {
        let totalScore = 0;
        console.log('\n   Individual Risk Scores:');
        report.assessments.forEach((assessment, index) => {
          const score = assessment.riskScore;
          totalScore += score;
          console.log(`   ${index + 1}. ${assessment.subcategoryName}: L${assessment.likelihoodScore} × I${assessment.impactScore} = ${score} (${assessment.riskLevel})`);
        });
        
        const calculatedAverage = totalScore / report.assessments.length;
        console.log(`\n   📊 Calculated Average: ${calculatedAverage.toFixed(1)}`);
        console.log(`   💾 Stored Score: ${report.overallRiskScore}`);
        console.log(`   🔍 Score Match: ${Math.abs(calculatedAverage - (report.overallRiskScore || 0)) < 0.1 ? 'YES' : 'NO'}`);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugScoring();
