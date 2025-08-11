
const FormData = require('form-data');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function testAnalysisFix() {
  const prisma = new PrismaClient();
  
  console.log('🧪 TESTING ANALYSIS CRASH FIX');
  console.log('==============================');
  
  try {
    // Create a test document
    const testContent = `
    AI RFP Test Document - Risk Analysis
    =====================================
    
    1. Data Privacy Requirements
    - Personal data processing with GDPR compliance
    - Consent mechanisms required
    - Data protection by design
    
    2. AI Ethics Requirements  
    - Bias detection and mitigation
    - Algorithmic transparency
    - Fairness in decision making
    
    3. Security Requirements
    - Cybersecurity vulnerabilities assessment
    - Network security protocols
    - System reliability measures
    
    4. Regulatory Compliance
    - EU AI Act compliance
    - Sector-specific regulations
    - Data protection impact assessment
    
    5. Technical Implementation
    - Integration challenges
    - Cost management
    - Vendor selection criteria
    `;

    const testFilePath = '/tmp/test_analysis_fix.txt';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Created test document');

    // Upload the document
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('perspective', 'buyer');

    console.log('📤 Uploading test document...');
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    const reportId = uploadResult.reportId;
    console.log(`✅ Document uploaded successfully, Report ID: ${reportId}`);

    // Monitor the analysis progress
    console.log('🔍 Monitoring analysis progress...');
    let analysisComplete = false;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    
    while (!analysisComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;
      
      try {
        const statusResponse = await fetch(`http://localhost:3000/api/reports/${reportId}`);
        const statusData = await statusResponse.json();
        
        console.log(`⏳ Attempt ${attempts}: Status = ${statusData.report.status}`);
        
        if (statusData.report.status === 'completed') {
          analysisComplete = true;
          console.log('🎉 ANALYSIS COMPLETED SUCCESSFULLY!');
          console.log(`📊 Total risks found: ${statusData.analytics.totalRisks}`);
          console.log(`🎯 Risk score: ${statusData.report.overallRiskScore}/25`);
          console.log(`⚠️ Risk level: ${statusData.report.overallRiskLevel}`);
          
          // Check for regulatory references and industry best practices
          const hasRegRefs = statusData.assessments.some(a => a.regulatoryReferences && a.regulatoryReferences.length > 0);
          const hasBestPractices = statusData.assessments.some(a => a.industryBestPractices && a.industryBestPractices.length > 0);
          
          console.log(`📋 Regulatory references: ${hasRegRefs ? '✅ PRESENT' : '❌ MISSING'}`);
          console.log(`🏆 Industry best practices: ${hasBestPractices ? '✅ PRESENT' : '❌ MISSING'}`);
          
          return {
            success: true,
            reportId,
            totalRisks: statusData.analytics.totalRisks,
            riskScore: statusData.report.overallRiskScore,
            hasRegRefs,
            hasBestPractices
          };
          
        } else if (statusData.report.status === 'failed') {
          console.log('❌ ANALYSIS FAILED');
          return {
            success: false,
            error: 'Analysis failed',
            reportId
          };
        }
        
      } catch (error) {
        console.log(`⚠️ Error checking status: ${error.message}`);
      }
    }
    
    console.log('⏰ ANALYSIS TIMEOUT - Taking too long');
    return {
      success: false,
      error: 'Analysis timeout',
      reportId
    };

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
    // Clean up test file
    try {
      fs.unlinkSync('/tmp/test_analysis_fix.txt');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Run the test
testAnalysisFix().then(result => {
  console.log('\n🏁 TEST RESULT:');
  console.log('================');
  if (result.success) {
    console.log('✅ ANALYSIS CRASH FIX: WORKING');
    console.log(`✅ Comprehensive analysis: ${result.totalRisks} risks generated`);
    console.log(`✅ Risk scoring: ${result.riskScore}/25`);
    console.log(`✅ Regulatory compliance: ${result.hasRegRefs ? 'INTEGRATED' : 'MISSING'}`);
    console.log(`✅ Industry best practices: ${result.hasBestPractices ? 'INTEGRATED' : 'MISSING'}`);
  } else {
    console.log('❌ ANALYSIS CRASH FIX: FAILED');
    console.log(`❌ Error: ${result.error}`);
    if (result.reportId) {
      console.log(`📋 Report ID for debugging: ${result.reportId}`);
    }
  }
  process.exit(result.success ? 0 : 1);
});
