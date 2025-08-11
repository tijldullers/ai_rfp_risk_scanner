const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSpecificReport() {
  try {
    const reportId = 'cmdxa5ln40000rmpjpacw3man'; // The fresh test report
    
    console.log(`🔧 Fixing specific report: ${reportId}`);
    
    // Get the report with assessments
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { assessments: true }
    });
    
    if (!report) {
      console.log('❌ Report not found');
      return;
    }
    
    console.log(`📊 Report "${report.fileName}" has ${report.assessments.length} assessments`);
    console.log(`   Current overall score: ${report.overallRiskScore}/25`);
    
    if (report.assessments.length === 0) {
      console.log('⚠️ No assessments found - cannot calculate score');
      return;
    }
    
    // Calculate new overall score
    const riskScores = report.assessments.map(assessment => assessment.riskScore);
    const totalRiskScore = riskScores.reduce((sum, score) => sum + score, 0);
    const calculatedOverallRiskScore = Math.round((totalRiskScore / riskScores.length) * 10) / 10;
    
    console.log(`📊 Individual scores: [${riskScores.join(', ')}]`);
    console.log(`📊 Total: ${totalRiskScore}, Average: ${calculatedOverallRiskScore}`);
    
    // Calculate overall risk level based on distribution
    const extremeCount = report.assessments.filter(a => a.riskLevel === 'extreme').length;
    const highCount = report.assessments.filter(a => a.riskLevel === 'high').length;
    const mediumCount = report.assessments.filter(a => a.riskLevel === 'medium').length;
    const lowCount = report.assessments.filter(a => a.riskLevel === 'low').length;
    
    let calculatedOverallRiskLevel = 'low';
    if (extremeCount > 0 || calculatedOverallRiskScore >= 20) {
      calculatedOverallRiskLevel = 'extreme';
    } else if (highCount > 0 || calculatedOverallRiskScore >= 15) {
      calculatedOverallRiskLevel = 'high';  
    } else if (mediumCount > 0 || calculatedOverallRiskScore >= 10) {
      calculatedOverallRiskLevel = 'medium';
    }
    
    console.log(`📊 Risk distribution: Extreme=${extremeCount}, High=${highCount}, Medium=${mediumCount}, Low=${lowCount}`);
    console.log(`📊 Calculated level: ${calculatedOverallRiskLevel}`);
    
    // Update the report
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        overallRiskScore: calculatedOverallRiskScore,
        overallRiskLevel: calculatedOverallRiskLevel
      }
    });
    
    console.log(`✅ Updated report: ${updatedReport.overallRiskScore}/25 (${updatedReport.overallRiskLevel})`);
    console.log(`🌐 View at: http://localhost:3000/analysis/${reportId}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpecificReport();