const fs = require('fs');
const path = require('path');

async function testMegaInsuranceAnalysis() {
  try {
    console.log('🚀 Starting MegaInsurance RFP Analysis Test...');
    
    const filePath = '/home/ubuntu/ai_rfp_risk_scanner/uploads/MegaInsurance_RFP_Chatbot.pdf';
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log('📄 File found:', {
      path: filePath,
      size: fileStats.size,
      lastModified: fileStats.mtime
    });

    // Step 1: Upload the file
    console.log('📤 Step 1: Uploading MegaInsurance RFP...');
    
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'MegaInsurance_RFP_Chatbot.pdf');

    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadResult);

    // Step 2: Start analysis
    console.log('🔍 Step 2: Starting comprehensive analysis...');
    
    const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: uploadResult.reportId,
        filepath: uploadResult.filepath,
        fileType: 'application/pdf',
        perspective: 'buyer'
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`Analysis failed: ${analysisResponse.statusText}`);
    }

    const analysisResult = await analysisResponse.json();
    console.log('✅ Analysis initiated:', analysisResult);

    // Step 3: Monitor analysis progress
    console.log('⏳ Step 3: Monitoring analysis progress...');
    
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`http://localhost:3000/api/reports/${uploadResult.reportId}`);
      if (statusResponse.ok) {
        const reportData = await statusResponse.json();
        console.log(`📊 Attempt ${attempts + 1}: Status = ${reportData.status}, Score = ${reportData.overallRiskScore}/25`);
        
        if (reportData.status === 'completed') {
          console.log('🎉 Analysis completed successfully!');
          console.log('📊 Final Results:', {
            reportId: reportData.id,
            fileName: reportData.fileName,
            overallRiskScore: reportData.overallRiskScore,
            overallRiskLevel: reportData.overallRiskLevel,
            assessmentCount: reportData.assessments?.length || 0,
            status: reportData.status
          });
          
          if (reportData.assessments && reportData.assessments.length > 0) {
            console.log('🔍 Risk Assessment Categories:');
            reportData.assessments.forEach((assessment, index) => {
              console.log(`  ${index + 1}. ${assessment.category} - ${assessment.subcategoryName} (${assessment.riskScore}/25 - ${assessment.riskLevel})`);
            });
          }
          
          break;
        } else if (reportData.status === 'failed') {
          console.log('❌ Analysis failed:', reportData.summary);
          break;
        }
      }
      
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.log('⏰ Analysis timed out after 5 minutes');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMegaInsuranceAnalysis();