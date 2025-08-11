
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRiskScores() {
  try {
    console.log('🔧 Starting risk score recalculation for existing reports...');
    
    // Find all reports with overallRiskScore of 0 or null
    const brokenReports = await prisma.report.findMany({
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
    
    console.log(`📊 Found ${brokenReports.length} reports with broken risk scores`);
    
    for (const report of brokenReports) {
      if (report.assessments.length === 0) {
        console.log(`⚠️ Skipping report ${report.id} (${report.fileName}) - no assessments found`);
        continue;
      }
      
      // Calculate weighted average risk score
      const riskScores = report.assessments.map(assessment => assessment.riskScore);
      const totalRiskScore = riskScores.reduce((sum, score) => sum + score, 0);
      const calculatedOverallRiskScore = Math.round((totalRiskScore / riskScores.length) * 10) / 10;
      
      // Calculate overall risk level based on distribution
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
      
      // Update the report with calculated values
      await prisma.report.update({
        where: { id: report.id },
        data: {
          overallRiskScore: calculatedOverallRiskScore,
          overallRiskLevel: calculatedOverallRiskLevel
        }
      });
      
      console.log(`✅ Fixed report ${report.id} (${report.fileName}): ${calculatedOverallRiskScore}/25 (${calculatedOverallRiskLevel}) - ${report.assessments.length} assessments`);
      console.log(`   Risk distribution - Extreme: ${extremeCount}, High: ${highCount}, Medium: ${mediumCount}, Low: ${report.assessments.length - extremeCount - highCount - mediumCount}`);
    }
    
    console.log(`🎉 Successfully recalculated risk scores for ${brokenReports.length} reports`);
    
  } catch (error) {
    console.error('❌ Error fixing risk scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRiskScores();
