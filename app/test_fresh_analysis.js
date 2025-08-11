const fs = require('fs');
const path = require('path');

async function testFreshAnalysis() {
  try {
    console.log('🧪 Testing FRESH analysis with MegaInsurance document...');
    
    // Using built-in fetch (Node 18+)
    const filePath = '/home/ubuntu/ai_rfp_risk_scanner/uploads/MegaInsurance_RFP_Chatbot.pdf';
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create FormData for upload
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'MegaInsurance_FRESH_TEST.pdf');
    formData.append('perspective', 'buyer'); // Required field!

    console.log('📤 Uploading fresh document...');
    
    // Upload file
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log('❌ Upload failed:', uploadResponse.status, errorText);
      return;
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', { 
      reportId: uploadResult.reportId, 
      message: uploadResult.message 
    });

    console.log('🔍 Analysis automatically started in background...');

    // Monitor progress
    console.log('⏳ Monitoring analysis progress...');
    
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const statusResponse = await fetch(`http://localhost:3000/api/reports/${uploadResult.reportId}`);
        if (statusResponse.ok) {
          const reportData = await statusResponse.json();
          console.log(`📊 Check ${attempts + 1}: Status=${reportData.status}, Score=${reportData.overallRiskScore}/25, Assessments=${reportData.assessments?.length || 0}`);
          
          if (reportData.status === 'completed') {
            console.log('\n🎉 ===== FRESH ANALYSIS COMPLETED! =====');
            console.log('📊 FINAL RESULTS:');
            console.log(`   • Report ID: ${reportData.id}`);
            console.log(`   • File Name: ${reportData.fileName}`);
            console.log(`   • Overall Risk Score: ${reportData.overallRiskScore}/25`);
            console.log(`   • Overall Risk Level: ${reportData.overallRiskLevel}`);
            console.log(`   • Total Assessments: ${reportData.assessments?.length || 0}`);
            
            // CRITICAL CHECK: Verify scoring works for new reports
            if (reportData.overallRiskScore > 0) {
              console.log('\n✅ SCORING VERIFICATION: PASSED - NEW REPORTS WORK!');
              console.log(`   Risk score properly calculated: ${reportData.overallRiskScore}/25`);
            } else {
              console.log('\n❌ SCORING VERIFICATION: FAILED - NEW REPORTS STILL BROKEN!');
              console.log('   Risk score is still 0 - fix did not work for new analyses');
            }
            
            // Check individual assessment scores
            if (reportData.assessments && reportData.assessments.length > 0) {
              console.log('\n🔍 INDIVIDUAL RISK SCORES:');
              let validScores = 0;
              reportData.assessments.forEach((assessment, index) => {
                const score = assessment.riskScore || 0;
                const likelihood = assessment.likelihoodScore || 0;
                const impact = assessment.impactScore || 0;
                
                console.log(`   ${index + 1}. ${assessment.subcategoryName || 'Unknown'}`);
                console.log(`      L:${likelihood} × I:${impact} = ${score}/25 (${assessment.riskLevel})`);
                
                if (score > 0) validScores++;
              });
              
              console.log(`\n📊 SCORE SUMMARY: ${validScores}/${reportData.assessments.length} assessments have valid scores`);
              
              // Check regulatory compliance
              const hasRegulatory = reportData.assessments.some(a => 
                a.regulatoryReferences && a.regulatoryReferences.length > 0
              );
              const hasBestPractices = reportData.assessments.some(a => 
                a.industryBestPractices && a.industryBestPractices.length > 0
              );
              
              console.log(`🏛️ REGULATORY COMPLIANCE: ${hasRegulatory ? '✅ PRESENT' : '❌ MISSING'}`);
              console.log(`🏅 INDUSTRY BEST PRACTICES: ${hasBestPractices ? '✅ PRESENT' : '❌ MISSING'}`);
            }
            
            console.log(`\n🌐 View results: http://localhost:3000/analysis/${reportData.id}`);
            return reportData.id; // Return report ID for viewing
            
          } else if (reportData.status === 'failed') {
            console.log(`❌ Analysis failed: ${reportData.summary || 'Unknown error'}`);
            return null;
          }
        }
      } catch (statusError) {
        console.log(`⚠️ Status check ${attempts + 1} failed:`, statusError.message);
      }
      
      attempts++;
    }
    
    console.log('⏰ Analysis timed out after 2 minutes');
    return null;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Run the test
testFreshAnalysis().then(reportId => {
  if (reportId) {
    console.log(`\n🎯 SUCCESS! Fresh analysis completed with report ID: ${reportId}`);
  } else {
    console.log('\n❌ FAILED! Fresh analysis did not complete successfully');
  }
});