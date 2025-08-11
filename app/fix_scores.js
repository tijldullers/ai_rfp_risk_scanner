
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOverallScores() {
  try {
    console.log('🔧 Starting retroactive score fix for all reports...');
    
    // Get all reports with 0 overall score but have assessments
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { overallRiskScore: 0 },
          { overallRiskScore: null }
        ]
      },
      include: {
        assessments: true
      }
    });
    
    console.log(`📊 Found ${reports.length} reports to fix`);
    
    let fixedCount = 0;
    
    for (const report of reports) {
      if (report.assessments.length === 0) {
        console.log(`⏭️  Skipping ${report.fileName} - no assessments`);
        continue;
      }
      
      // Calculate correct overall score from individual assessments
      const validScores = report.assessments
        .filter(a => a.riskScore > 0)
        .map(a => a.riskScore);
      
      if (validScores.length === 0) {
        console.log(`⏭️  Skipping ${report.fileName} - no valid individual scores`);
        continue;
      }
      
      const averageScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
      const roundedScore = Math.round(averageScore * 10) / 10;
      
      // Calculate risk level based on distribution
      const riskLevels = report.assessments.map(a => a.riskLevel);
      const extremeCount = riskLevels.filter(l => l === 'extreme').length;
      const highCount = riskLevels.filter(l => l === 'high').length;
      const mediumCount = riskLevels.filter(l => l === 'medium').length;
      
      let overallLevel;
      if (extremeCount > 0 || roundedScore >= 20) {
        overallLevel = 'extreme';
      } else if (highCount > 0 || roundedScore >= 15) {
        overallLevel = 'high';
      } else if (mediumCount > 0 || roundedScore >= 10) {
        overallLevel = 'medium';
      } else {
        overallLevel = 'low';
      }
      
      // Update the report
      await prisma.report.update({
        where: { id: report.id },
        data: {
          overallRiskScore: roundedScore,
          overallRiskLevel: overallLevel
        }
      });
      
      console.log(`✅ Fixed ${report.fileName}: ${roundedScore}/25 (${overallLevel}) - from ${validScores.length} assessments`);
      fixedCount++;
    }
    
    console.log(`🎉 Successfully fixed ${fixedCount} reports!`);
    
  } catch (error) {
    console.error('❌ Error fixing scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOverallScores();
