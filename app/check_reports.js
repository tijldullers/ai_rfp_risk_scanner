const { PrismaClient } = require('@prisma/client');

async function checkReports() {
  const prisma = new PrismaClient();
  
  try {
    // Get the most recent 3 reports
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        assessments: true
      }
    });
    
    console.log('Recent Reports:');
    reports.forEach((report, index) => {
      console.log(`\n${index + 1}. Report: ${report.fileName}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Created: ${report.createdAt}`);
      console.log(`   Risk Assessments: ${report.assessments.length}`);
      
      if (report.assessments.length > 0) {
        console.log('   Categories:');
        const categories = [...new Set(report.assessments.map(r => r.categoryName))];
        console.log(`   - ${categories.join('\n   - ')}`);
        
        // Check if regulatory references exist
        const withRegRefs = report.assessments.filter(r => r.regulatoryReferences && r.regulatoryReferences.length > 0).length;
        const withBestPractices = report.assessments.filter(r => r.industryBestPractices && r.industryBestPractices.length > 0).length;
        console.log(`   Regulatory References: ${withRegRefs}/${report.assessments.length}`);
        console.log(`   Industry Best Practices: ${withBestPractices}/${report.assessments.length}`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReports();
