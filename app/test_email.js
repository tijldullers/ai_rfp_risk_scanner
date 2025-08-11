const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmailVerification() {
  try {
    console.log('Creating test report...');
    
    // Create a test report
    const testReport = await prisma.report.create({
      data: {
        fileName: 'test-rfp-document.pdf',
        fileSize: 2048,
        fileType: 'application/pdf',
        perspective: 'buyer',
        status: 'completed',
        overallRiskScore: 8.2,
        overallRiskLevel: 'high',
        summary: 'This is a test report for email verification functionality.',
        recommendations: 'Test recommendations for risk mitigation.'
      }
    });

    console.log('Test report created with ID:', testReport.id);

    // Test the email verification endpoint
    console.log('Testing email verification endpoint...');
    
    const response = await fetch('http://localhost:3000/api/email-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        reportId: testReport.id
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Email verification test successful!');
    } else {
      console.log('❌ Email verification test failed!');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmailVerification();
