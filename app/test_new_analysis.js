const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testComprehensiveAnalysis() {
  try {
    console.log('🧪 Testing new comprehensive analysis logic...');
    
    // Upload the test document
    const form = new FormData();
    form.append('file', fs.createReadStream('test_comprehensive_ai_rfp.txt'));
    form.append('perspective', 'procurement_officer');
    
    console.log('📤 Uploading test document...');
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Upload failed: ' + uploadResponse.statusText);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful, Report ID:', uploadResult.reportId);
    
    // Monitor analysis progress
    console.log('⏳ Monitoring analysis progress...');
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`http://localhost:3000/api/reports/${uploadResult.reportId}`);
      const statusData = await statusResponse.json();
      
      console.log(`📊 Attempt ${attempts + 1}: Status = ${statusData.report.status}, Assessments = ${statusData.assessments.length}`);
      
      if (statusData.report.status === 'completed') {
        console.log('\n🎉 ANALYSIS COMPLETED!');
        console.log(`📈 Total Risk Assessments: ${statusData.assessments.length}`);
        
        // Count categories
        const categories = [...new Set(statusData.assessments.map(a => a.categoryName))];
        console.log(`📋 Categories Covered: ${categories.length}`);
        console.log('🏷️ Categories:', categories.join(', '));
        
        // Check regulatory compliance
        const withRegRefs = statusData.assessments.filter(a => a.regulatoryReferences && a.regulatoryReferences.length > 0).length;
        const withBestPractices = statusData.assessments.filter(a => a.industryBestPractices && a.industryBestPractices.length > 0).length;
        
        console.log(`🏛️ Assessments with Regulatory References: ${withRegRefs}/${statusData.assessments.length}`);
        console.log(`🏆 Assessments with Industry Best Practices: ${withBestPractices}/${statusData.assessments.length}`);
        
        // Success criteria
        const isComprehensive = statusData.assessments.length >= 12;
        const hasRegCompliance = withRegRefs === statusData.assessments.length;
        const hasBestPractices = withBestPractices === statusData.assessments.length;
        
        console.log('\n✅ COMPREHENSIVE ANALYSIS VALIDATION:');
        console.log(`   Minimum 12 assessments: ${isComprehensive ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   All have regulatory refs: ${hasRegCompliance ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   All have best practices: ${hasBestPractices ? '✅ PASS' : '❌ FAIL'}`);
        
        if (isComprehensive && hasRegCompliance && hasBestPractices) {
          console.log('\n🎯 SUCCESS: Comprehensive analysis working correctly!');
        } else {
          console.log('\n⚠️ PARTIAL SUCCESS: Some requirements not fully met');
        }
        
        console.log(`\n🔗 View results: http://localhost:3000/analysis/${uploadResult.reportId}`);
        break;
      } else if (statusData.report.status === 'failed') {
        console.log('❌ Analysis failed:', statusData.report.summary);
        break;
      }
      
      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.log('⏰ Analysis timeout after 5 minutes');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testComprehensiveAnalysis();
