
const { PrismaClient } = require('@prisma/client');

async function testReanalysis() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 TESTING ANALYSIS CRASH FIX BY REANALYZING');
    console.log('============================================');
    
    // Get the failed document
    const failedReport = await prisma.report.findFirst({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!failedReport) {
      console.log('❌ No failed reports found to test with');
      return;
    }
    
    console.log(`📋 Found failed report: ${failedReport.id} - ${failedReport.fileName}`);
    
    // Reset it to processing to trigger reanalysis
    await prisma.report.update({
      where: { id: failedReport.id },
      data: {
        status: 'processing',
        overallRiskScore: null,
        overallRiskLevel: null,
        summary: null,
        recommendations: null
      }
    });
    
    // Clear existing risk assessments if any
    await prisma.riskAssessment.deleteMany({
      where: { reportId: failedReport.id }
    });
    
    console.log('✅ Reset report status to processing');
    console.log(`🔗 Monitor analysis at: http://localhost:3000/analysis/${failedReport.id}`);
    
    // Trigger analysis via API
    console.log('🚀 Triggering analysis...');
    
    const analysisResponse = await fetch('http://localhost:3000/api/analyze-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportId: failedReport.id,
        filepath: `/home/ubuntu/ai_rfp_risk_scanner/uploads/1754296821657-${failedReport.fileName}`,
        fileType: failedReport.fileType,
        perspective: failedReport.perspective
      })
    });

    if (analysisResponse.ok) {
      console.log('✅ Analysis triggered successfully');
      console.log('⏳ Monitor the server logs and check the analysis page');
      console.log(`📊 Analysis URL: http://localhost:3000/analysis/${failedReport.id}`);
    } else {
      console.log(`❌ Failed to trigger analysis: ${analysisResponse.status}`);
      const errorText = await analysisResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReanalysis();
