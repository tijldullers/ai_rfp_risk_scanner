
const FormData = require('form-data');
const fs = require('fs');

async function testAnalysis() {
  console.log('🧪 Starting test analysis...');
  
  try {
    // Step 1: Create a simple test document
    const testContent = `
AI Chatbot RFP - Test Document

Requirements:
1. The system must process customer data in compliance with GDPR
2. AI models should be transparent and explainable
3. Cybersecurity measures must protect against data breaches
4. The solution should include bias detection and mitigation
5. Regular audits and compliance monitoring required

Technical Specifications:
- Cloud-based deployment
- Real-time processing capabilities  
- Integration with existing CRM systems
- Multi-language support

Data Processing:
- Personal data collection and storage
- Automated decision-making processes
- Data retention policies
- User consent management
`;

    fs.writeFileSync('/tmp/test_rfp.txt', testContent);
    
    // Step 2: Upload the document
    console.log('📤 Uploading test document...');
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', fs.createReadStream('/tmp/test_rfp.txt'));
    uploadFormData.append('perspective', 'buyer');
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: uploadFormData,
      headers: uploadFormData.getHeaders()
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadResult);
    
    // Step 3: Start analysis
    console.log('🔍 Starting analysis...');
    
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
    console.log('✅ Analysis completed:', analyzeResult);
    
    // Step 4: Check the results
    console.log('📊 Checking analysis results in database...');
    
    // Import Prisma client here to check results
    setTimeout(async () => {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      try {
        const report = await prisma.report.findUnique({
          where: { id: uploadResult.reportId },
          include: { assessments: true }
        });
        
        console.log('📋 Final Report Results:');
        console.log(`   Overall Risk Score: ${report.overallRiskScore}/25`);
        console.log(`   Overall Risk Level: ${report.overallRiskLevel}`);
        console.log(`   Number of Assessments: ${report.assessments.length}`);
        
        if (report.assessments.length > 0) {
          console.log('\n📊 Individual Risk Assessments:');
          report.assessments.forEach((assessment, index) => {
            console.log(`   ${index + 1}. ${assessment.subcategoryName}`);
            console.log(`      L${assessment.likelihoodScore} × I${assessment.impactScore} = ${assessment.riskScore} (${assessment.riskLevel})`);
          });
        }
        
        await prisma.$disconnect();
        
      } catch (error) {
        console.error('Error checking results:', error);
      }
    }, 5000); // Wait 5 seconds for analysis to complete
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAnalysis();
