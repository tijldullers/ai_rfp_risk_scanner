const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testComprehensiveAnalysis() {
  try {
    console.log('🧪 Creating test document for comprehensive analysis...');
    
    // Create a comprehensive test document that should trigger multiple risk categories
    const testContent = `
    AI-Powered Insurance Claims Processing System RFP
    
    SCOPE: Implementation of advanced AI chatbot and automated decision-making system
    
    TECHNICAL REQUIREMENTS:
    - Machine learning models for fraud detection and risk assessment
    - Natural language processing for customer interactions
    - Automated claim approval/denial decisions
    - Integration with external data sources and third-party APIs
    - Real-time processing capabilities
    - Cloud-based infrastructure deployment
    
    DATA HANDLING:
    - Processing of sensitive personal and financial data
    - Customer conversation logs and interaction history
    - Historical claims data and patterns
    - Integration with credit scoring systems
    - Cross-border data transfers for multinational operations
    
    AI GOVERNANCE:
    - Board oversight of AI systems implementation
    - Risk management framework for AI operations
    - Audit trails and decision transparency
    - Human oversight mechanisms
    - Bias monitoring and fairness assessments
    
    SECURITY REQUIREMENTS:
    - Cybersecurity measures for AI systems
    - Protection against adversarial attacks
    - Secure API integrations
    - Incident response procedures
    - Data encryption and access controls
    
    COMPLIANCE:
    - GDPR compliance for data protection
    - Financial services regulations
    - AI Act compliance requirements
    - Regular compliance audits and reporting
    - Documentation of AI decision processes
    
    OPERATIONAL REQUIREMENTS:
    - 24/7 system availability
    - Scalability for high transaction volumes
    - Integration with existing insurance systems
    - Performance monitoring and optimization
    - Disaster recovery and business continuity
    `;
    
    // Write test file
    const testFilePath = path.join(process.cwd(), 'test_comprehensive_rfp.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Test document created, initiating analysis...');
    
    // Create report entry
    const report = await prisma.report.create({
      data: {
        fileName: 'test_comprehensive_rfp.txt',
        fileSize: testContent.length,
        filePath: testFilePath,
        fileType: 'text/plain',
        status: 'uploaded',
        perspective: 'regulator',
        userId: '1' // Assuming user ID 1 exists
      }
    });
    
    console.log(`📊 Created test report with ID: ${report.id}`);
    
    // Call the analysis API
    const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: report.id,
        filepath: testFilePath,
        fileType: 'text/plain',
        perspective: 'regulator'
      })
    });
    
    if (!analysisResponse.ok) {
      throw new Error(`Analysis API error: ${analysisResponse.statusText}`);
    }
    
    const analysisResult = await analysisResponse.json();
    console.log('✅ Analysis completed successfully');
    
    // Wait a moment for database to be updated
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check the results
    const updatedReport = await prisma.report.findUnique({
      where: { id: report.id },
      include: {
        riskAssessments: true,
        regulatoryComplianceAnalysis: true
      }
    });
    
    console.log(`\n📈 COMPREHENSIVE ANALYSIS RESULTS:`);
    console.log(`Report Status: ${updatedReport.status}`);
    console.log(`Overall Risk Score: ${updatedReport.overallRiskScore}`);
    console.log(`Overall Risk Level: ${updatedReport.overallRiskLevel}`);
    console.log(`Number of Risk Assessments: ${updatedReport.riskAssessments.length}`);
    
    if (updatedReport.riskAssessments.length > 5) {
      console.log('✅ SUCCESS: Analysis generated more than 5 risk assessments!');
    } else {
      console.log('❌ ISSUE: Analysis still limited to 5 or fewer risk assessments');
    }
    
    // Show risk categories covered
    const categories = [...new Set(updatedReport.riskAssessments.map(r => r.categoryName))];
    console.log(`\n📋 RISK CATEGORIES COVERED (${categories.length}):`);
    categories.forEach(cat => console.log(`  - ${cat}`));
    
    // Show regulatory compliance integration
    if (updatedReport.regulatoryComplianceAnalysis) {
      console.log('\n🏛️ REGULATORY COMPLIANCE ANALYSIS: ✅ INTEGRATED');
    } else {
      console.log('\n🏛️ REGULATORY COMPLIANCE ANALYSIS: ❌ MISSING');
    }
    
    // Sample of risk assessments with regulatory references
    console.log('\n📊 SAMPLE RISK ASSESSMENTS WITH REGULATORY REFERENCES:');
    updatedReport.riskAssessments.slice(0, 3).forEach((risk, index) => {
      console.log(`\n${index + 1}. ${risk.subcategoryName || risk.categoryName}`);
      console.log(`   Risk Score: ${risk.riskScore} (${risk.riskLevel})`);
      console.log(`   Regulatory References: ${risk.regulatoryReferences.length}`);
      console.log(`   Industry Best Practices: ${risk.industryBestPractices.length}`);
    });
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    
    console.log('\n🧪 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testComprehensiveAnalysis();
