const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingReports() {
  try {
    const reports = await prisma.report.findMany({
      include: {
        assessments: true,
        complianceAnalysis: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });
    
    console.log(`Found ${reports.length} existing reports:`);
    
    reports.forEach((report, index) => {
      console.log(`\n${index + 1}. Report ID: ${report.id}`);
      console.log(`   File: ${report.fileName}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Risk Assessments: ${report.assessments.length}`);
      console.log(`   Risk Score: ${report.overallRiskScore || 'N/A'}`);
      console.log(`   Risk Level: ${report.overallRiskLevel || 'N/A'}`);
      console.log(`   Compliance Analysis: ${report.complianceAnalysis ? '✅' : '❌'}`);
      
      if (report.assessments.length > 0) {
        const categories = [...new Set(report.assessments.map(r => r.categoryName))];
        console.log(`   Categories Covered: ${categories.length} - ${categories.join(', ')}`);
        
        // Show sample regulatory references
        const sampleAssessment = report.assessments[0];
        console.log(`   Sample Regulatory Refs: ${sampleAssessment.regulatoryReferences.length}`);
        console.log(`   Sample Best Practices: ${sampleAssessment.industryBestPractices.length}`);
      }
    });
    
    if (reports.length > 0 && reports[0].assessments.length > 5) {
      console.log('\n✅ SUCCESS: Found reports with more than 5 risk assessments!');
    } else if (reports.length > 0 && reports[0].assessments.length <= 5) {
      console.log('\n❌ ISSUE: Latest reports still limited to 5 or fewer risk assessments');
    } else {
      console.log('\n📝 No reports found to analyze');
    }
    
  } catch (error) {
    console.error('❌ Error checking reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingReports();
