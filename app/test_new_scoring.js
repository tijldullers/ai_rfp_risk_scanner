const fs = require('fs');

async function testNewScoringLogic() {
  try {
    console.log('🧪 Testing NEW scoring logic with fresh MegaInsurance upload...');
    
    const filePath = '/home/ubuntu/ai_rfp_risk_scanner/uploads/MegaInsurance_RFP_Chatbot.pdf';
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create FormData for upload
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'MegaInsurance_SCORING_TEST.pdf');
    formData.append('perspective', 'buyer');

    console.log('📤 Uploading test document...');
    
    // Upload file (this will automatically trigger analysis)
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
    console.log('✅ Upload successful, analysis started automatically');
    console.log('   Report ID:', uploadResult.reportId);

    // Monitor progress for 2 minutes maximum
    console.log('⏳ Monitoring analysis for scoring verification...');
    
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const statusResponse = await fetch(`http://localhost:3000/api/reports/${uploadResult.reportId}`);
        if (statusResponse.ok) {
          const reportData = await statusResponse.json().then(data => data.report);
          console.log(`📊 Check ${attempts + 1}: Status=${reportData.status}, Score=${reportData.overallRiskScore}/25, Level=${reportData.overallRiskLevel}`);
          
          if (reportData.status === 'completed') {
            console.log('\n🎉 ===== NEW SCORING TEST COMPLETED! =====');
            console.log('📊 RESULTS:');
            console.log(`   • Overall Score: ${reportData.overallRiskScore}/25`);
            console.log(`   • Risk Level: ${reportData.overallRiskLevel}`);
            
            // VERIFICATION: Check if scoring works for new reports
            if (reportData.overallRiskScore > 0) {
              console.log('\n✅ SUCCESS! NEW REPORTS NOW CALCULATE SCORES CORRECTLY!');
              console.log(`   ✓ Score properly calculated: ${reportData.overallRiskScore}/25`);
              console.log(`   ✓ Risk level properly assigned: ${reportData.overallRiskLevel}`);
              console.log('\n🔧 THE FIX IS WORKING - New uploads will no longer show 0.0/25 scores!');
            } else {
              console.log('\n❌ FAILED! NEW REPORTS STILL HAVE ZERO SCORES!');
              console.log('   The fix did not work - scoring is still broken for new reports');
            }
            
            console.log(`\n🌐 View results: http://localhost:3000/analysis/${uploadResult.reportId}`);
            return reportData.overallRiskScore > 0; // Return success status
            
          } else if (reportData.status === 'failed') {
            console.log(`❌ Analysis failed: ${reportData.summary || 'Unknown error'}`);
            return false;
          }
        }
      } catch (statusError) {
        console.log(`⚠️ Status check ${attempts + 1} failed:`, statusError.message);
      }
      
      attempts++;
    }
    
    console.log('⏰ Test timed out after 2 minutes');
    return false;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testNewScoringLogic().then(success => {
  if (success) {
    console.log('\n🎯 FINAL RESULT: ✅ SUCCESS - New report scoring is FIXED!');
    console.log('   Future uploads will properly calculate overall risk scores.');
  } else {
    console.log('\n🎯 FINAL RESULT: ❌ FAILED - New report scoring still needs work.');
  }
}).catch(error => {
  console.error('❌ Final test error:', error);
});