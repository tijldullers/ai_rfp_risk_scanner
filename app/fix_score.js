
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixScore() {
  try {
    const reportId = 'cmdx0fgaz0000rvu8pbgiatwc';
    
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        assessments: true
      }
    });
    
    if (!report) {
      console.log('Report not found');
      return;
    }
    
    console.log('=== BEFORE FIX ===');
    console.log('Current Overall Risk Score:', report.overallRiskScore);
    console.log('Current Overall Risk Level:', report.overallRiskLevel);
    console.log('Number of assessments:', report.assessments.length);
    
    if (report.assessments.length > 0) {
      // Calculate the correct overall risk score
      const validScores = report.assessments
        .map(a => a.riskScore)
        .filter(score => score > 0);
      
      if (validScores.length > 0) {
        const totalScore = validScores.reduce((sum, score) => sum + score, 0);
        const calculatedOverallRiskScore = Math.round((totalScore / validScores.length) * 10) / 10;
        
        // Calculate overall risk level based on score and distribution
        const riskLevels = report.assessments.map(a => a.riskLevel);
        const extremeCount = riskLevels.filter(l => l === 'extreme').length;
        const highCount = riskLevels.filter(l => l === 'high').length;
        const mediumCount = riskLevels.filter(l => l === 'medium').length;
        
        let calculatedOverallRiskLevel = 'low';
        if (extremeCount > 0 || calculatedOverallRiskScore >= 20) {
          calculatedOverallRiskLevel = 'extreme';
        } else if (highCount > 0 || calculatedOverallRiskScore >= 15) {
          calculatedOverallRiskLevel = 'high';
        } else if (mediumCount > 0 || calculatedOverallRiskScore >= 10) {
          calculatedOverallRiskLevel = 'medium';
        }
        
        console.log('=== CALCULATION ===');
        console.log('Valid scores:', validScores);
        console.log('Total score:', totalScore);
        console.log('Calculated average:', calculatedOverallRiskScore);
        console.log('Risk level distribution:', { extreme: extremeCount, high: highCount, medium: mediumCount });
        console.log('Calculated risk level:', calculatedOverallRiskLevel);
        
        // Update the database
        const updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: {
            overallRiskScore: calculatedOverallRiskScore,
            overallRiskLevel: calculatedOverallRiskLevel
          }
        });
        
        console.log('=== AFTER FIX ===');
        console.log('Updated Overall Risk Score:', updatedReport.overallRiskScore);
        console.log('Updated Overall Risk Level:', updatedReport.overallRiskLevel);
        console.log('✅ Score fixed successfully!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixScore();
