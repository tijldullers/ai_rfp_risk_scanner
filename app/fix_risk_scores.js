
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRiskScores() {
  try {
    console.log('🔧 Starting risk score fix for existing reports...');
    
    // Get all completed reports with zero or null risk scores
    const reportsWithBadScores = await prisma.report.findMany({
      where: {
        status: 'completed',
        OR: [
          { overallRiskScore: 0 },
          { overallRiskScore: null }
        ]
      },
      include: {
        assessments: true
      }
    });
    
    console.log(`📋 Found ${reportsWithBadScores.length} reports with incorrect risk scores`);
    
    for (const report of reportsWithBadScores) {
      console.log(`\n🔄 Processing: ${report.fileName} (ID: ${report.id})`);
      console.log(`   Current score: ${report.overallRiskScore}/25 (${report.overallRiskLevel})`);
      console.log(`   Assessments: ${report.assessments.length}`);
      
      if (report.assessments.length === 0) {
        console.log('   ❌ No assessments found, skipping...');
        continue;
      }
      
      // Calculate new overall risk score
      const validAssessments = report.assessments.filter(a => a.riskScore && a.riskScore > 0);
      
      if (validAssessments.length === 0) {
        console.log('   ❌ No valid assessments with scores, skipping...');
        continue;
      }
      
      const totalRiskScore = validAssessments.reduce((sum, a) => sum + a.riskScore, 0);
      const calculatedOverallRiskScore = Math.round((totalRiskScore / validAssessments.length) * 10) / 10;
      
      // Calculate overall risk level based on score and distribution
      const extremeCount = report.assessments.filter(a => a.riskLevel === 'extreme').length;
      const highCount = report.assessments.filter(a => a.riskLevel === 'high').length;
      const mediumCount = report.assessments.filter(a => a.riskLevel === 'medium').length;
      
      let calculatedOverallRiskLevel = 'low';
      if (extremeCount > 0 || calculatedOverallRiskScore >= 20) {
        calculatedOverallRiskLevel = 'extreme';
      } else if (highCount > 0 || calculatedOverallRiskScore >= 15) {
        calculatedOverallRiskLevel = 'high';
      } else if (mediumCount > 0 || calculatedOverallRiskScore >= 10) {
        calculatedOverallRiskLevel = 'medium';
      }
      
      console.log(`   ✅ New calculated score: ${calculatedOverallRiskScore}/25 (${calculatedOverallRiskLevel})`);
      console.log(`   📊 Risk distribution - Extreme: ${extremeCount}, High: ${highCount}, Medium: ${mediumCount}, Low: ${report.assessments.length - extremeCount - highCount - mediumCount}`);
      
      // Update the report
      await prisma.report.update({
        where: { id: report.id },
        data: {
          overallRiskScore: calculatedOverallRiskScore,
          overallRiskLevel: calculatedOverallRiskLevel
        }
      });
      
      console.log(`   ✅ Updated successfully!`);
    }
    
    console.log('\n🎉 Risk score fix completed!');
    
    // Show summary of all reports
    console.log('\n📋 Updated Reports Summary:');
    const allReports = await prisma.report.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      select: {
        fileName: true,
        overallRiskScore: true,
        overallRiskLevel: true,
        _count: { select: { assessments: true } }
      }
    });
    
    allReports.forEach((report, idx) => {
      console.log(`${idx + 1}. ${report.fileName}`);
      console.log(`   Score: ${report.overallRiskScore}/25 (${report.overallRiskLevel})`);
      console.log(`   Assessments: ${report._count.assessments}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing risk scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRiskScores();
