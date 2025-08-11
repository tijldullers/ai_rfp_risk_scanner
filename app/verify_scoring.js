const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const report = await prisma.report.findFirst({
      where: { status: 'completed' },
      orderBy: { updatedAt: 'desc' },
      include: { assessments: true }
    });
    
    if (report) {
      console.log('✅ LATEST REPORT VERIFICATION:');
      console.log('📊 Report:', report.fileName);
      console.log('📊 Overall Score:', report.overallRiskScore + '/25');
      console.log('📊 Overall Level:', report.overallRiskLevel);
      console.log('📊 Assessments:', report.assessments.length);
      
      const riskDistribution = report.assessments.reduce((acc, a) => {
        acc[a.riskLevel] = (acc[a.riskLevel] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Risk Distribution:', riskDistribution);
      
      // Manual verification
      const avgScore = report.assessments.reduce((sum, a) => sum + a.riskScore, 0) / report.assessments.length;
      console.log('📊 Manual Average:', Math.round(avgScore * 10) / 10 + '/25');
      console.log('✅ Scores match:', report.overallRiskScore === Math.round(avgScore * 10) / 10 ? 'YES' : 'NO');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
