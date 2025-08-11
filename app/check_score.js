
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkScore() {
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
    
    console.log('=== REPORT DATA ===');
    console.log('Report ID:', report.id);
    console.log('File Name:', report.fileName);
    console.log('Status:', report.status);
    console.log('Overall Risk Score (DB):', report.overallRiskScore);
    console.log('Overall Risk Level (DB):', report.overallRiskLevel);
    
    console.log('\n=== INDIVIDUAL ASSESSMENTS ===');
    console.log('Number of assessments:', report.assessments.length);
    
    if (report.assessments.length > 0) {
      console.log('Individual scores:', report.assessments.map(a => a.riskScore));
      
      const validScores = report.assessments
        .map(a => a.riskScore)
        .filter(score => score > 0);
      
      if (validScores.length > 0) {
        const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
        console.log('Calculated average score:', Math.round(avgScore * 10) / 10);
        console.log('Valid scores count:', validScores.length);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScore();
