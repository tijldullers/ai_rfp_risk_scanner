
const fs = require('fs');
const FormData = require('form-data'); // You may need to install: npm install form-data

async function testAnalysisFixture() {
  console.log('🧪 Testing Analysis Crash Fix...');
  
  try {
    // Step 1: Upload test document
    console.log('📤 Step 1: Uploading test document...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('/home/ubuntu/ai_rfp_risk_scanner/test_fixed_analysis.txt'));
    form.append('perspective', 'buyer');
    form.append('anonymousEmail', 'test@example.com');
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadResult.reportId);
    
    // Step 2: Start analysis
    console.log('🔬 Step 2: Starting analysis...');
    
    const analyzeResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportId: uploadResult.reportId,
        filepath: uploadResult.filepath,
        fileType: 'text/plain',
        perspective: 'buyer'
      })
    });
    
    if (!analyzeResponse.ok) {
      throw new Error(`Analysis failed: ${analyzeResponse.statusText}`);
    }
    
    const analyzeResult = await analyzeResponse.json();
    console.log('✅ Analysis completed successfully:', analyzeResult);
    
    // Step 3: Check report status
    console.log('📊 Step 3: Checking report status...');
    
    const reportResponse = await fetch(`http://localhost:3000/api/reports/${uploadResult.reportId}`);
    
    if (!reportResponse.ok) {
      throw new Error(`Report fetch failed: ${reportResponse.statusText}`);
    }
    
    const reportResult = await reportResponse.json();
    console.log('✅ Report Status:', reportResult.status);
    console.log('📈 Overall Risk Score:', reportResult.overallRiskScore);
    console.log('🎯 Risk Level:', reportResult.overallRiskLevel);
    console.log('📝 Total Risk Assessments:', reportResult.assessments?.length || 0);
    
    if (reportResult.assessments && reportResult.assessments.length > 0) {
      console.log('🔍 Sample Assessment:');
      const sample = reportResult.assessments[0];
      console.log('  - Category:', sample.categoryName);
      console.log('  - Subcategory:', sample.subcategoryName);
      console.log('  - Risk Score:', sample.riskScore);
      console.log('  - Regulatory References:', sample.regulatoryReferences?.length || 0);
      console.log('  - Industry Best Practices:', sample.industryBestPractices?.length || 0);
    }
    
    console.log('🎉 TEST COMPLETED SUCCESSFULLY - NO CRASHES DETECTED!');
    return true;

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testAnalysisFixture()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = { testAnalysisFixture };
