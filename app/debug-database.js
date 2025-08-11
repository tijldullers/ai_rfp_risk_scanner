
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log('🔍 Checking recent reports and their risk assessments...\n');

    // Get the latest 3 reports
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        assessments: true
      }
    });

    for (const report of reports) {
      console.log(`📊 Report: ${report.fileName} (${report.id.slice(-8)})`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Created: ${report.createdAt.toISOString()}`);
      console.log(`   Risk Assessments: ${report.assessments.length}`);

      if (report.assessments.length > 0) {
        const sampleAssessment = report.assessments[0];
        console.log(`   Sample Risk Assessment: ${sampleAssessment.subcategoryName}`);
        console.log(`   Regulatory References: ${sampleAssessment.regulatoryReferences.length} items`);
        console.log(`   Industry Best Practices: ${sampleAssessment.industryBestPractices.length} items`);
        
        if (sampleAssessment.regulatoryReferences.length > 0) {
          console.log(`   First Regulatory Ref: ${sampleAssessment.regulatoryReferences[0]}`);
        }
        
        if (sampleAssessment.industryBestPractices.length > 0) {
          console.log(`   First Best Practice: ${sampleAssessment.industryBestPractices[0]}`);
        }
      }
      console.log('');
    }

    // Check overall compliance analysis
    const complianceAnalyses = await prisma.regulatoryComplianceAnalysis.findMany({
      orderBy: { id: 'desc' },
      take: 3
    });

    console.log(`📋 Regulatory Compliance Analyses: ${complianceAnalyses.length}`);
    
    if (complianceAnalyses.length > 0) {
      const sample = complianceAnalyses[0];
      console.log(`   Sample Analysis for Report: ${sample.reportId.slice(-8)}`);
      console.log(`   Risk Specific Regulatory Refs: ${sample.riskSpecificRegulatoryReferences.length}`);
      console.log(`   AI Governance Regulatory Refs: ${sample.aiGovernanceRegulatoryReferences.length}`);
      
      if (sample.riskSpecificRegulatoryReferences.length > 0) {
        console.log(`   First Risk Specific Ref: ${sample.riskSpecificRegulatoryReferences[0]}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();
