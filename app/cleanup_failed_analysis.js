
const { PrismaClient } = require('@prisma/client');

async function cleanupFailedAnalysis() {
  const prisma = new PrismaClient();

  try {
    console.log('🧹 Cleaning up failed analysis...');
    
    // Find the latest failed report
    const failedReports = await prisma.report.findMany({
      where: {
        OR: [
          { status: 'processing' },
          { status: 'analyzing' },
          { status: 'starting' },
          { status: 'extracting' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${failedReports.length} stuck reports`);

    if (failedReports.length > 0) {
      // Set status to failed for debugging
      await prisma.report.updateMany({
        where: {
          id: { in: failedReports.map(r => r.id) }
        },
        data: {
          status: 'failed'
        }
      });
      
      console.log(`✅ Updated ${failedReports.length} stuck reports to 'failed' status`);
      
      // Log the report IDs for reference
      failedReports.forEach(report => {
        console.log(`📋 Report: ${report.id} (${report.fileName}) - was stuck in '${report.status}' status`);
      });
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupFailedAnalysis();
