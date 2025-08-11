
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // Get the most recent report
    const latestReport = await prisma.report.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        assessments: {
          select: {
            id: true,
            subcategoryName: true,
            regulatoryReferences: true,
            industryBestPractices: true,
            regulatoryMapping: true
          }
        }
      }
    });
    
    if (!latestReport) {
      console.log('No reports found in database');
      return;
    }
    
    console.log('=== LATEST REPORT DEBUG ===');
    console.log('Report ID:', latestReport.id);
    console.log('Report Status:', latestReport.status);
    console.log('Report Filename:', latestReport.fileName);
    console.log('Created:', latestReport.createdAt);
    console.log('Total Assessments:', latestReport.assessments.length);
    
    console.log('\n=== ASSESSMENT REGULATORY DATA ===');
    latestReport.assessments.forEach((assessment, index) => {
      console.log(`\n--- Assessment ${index + 1}: ${assessment.subcategoryName} ---`);
      console.log('ID:', assessment.id);
      console.log('Regulatory References:', assessment.regulatoryReferences);
      console.log('Industry Best Practices:', assessment.industryBestPractices);
      console.log('Legacy Regulatory Mapping:', assessment.regulatoryMapping);
      console.log('RegRefs Count:', assessment.regulatoryReferences ? assessment.regulatoryReferences.length : 0);
      console.log('BestPractices Count:', assessment.industryBestPractices ? assessment.industryBestPractices.length : 0);
    });
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
