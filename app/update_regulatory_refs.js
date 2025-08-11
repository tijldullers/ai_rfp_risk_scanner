
const { PrismaClient } = require('@prisma/client');

async function updateExistingReports() {
  const prisma = new PrismaClient();
  
  const mapRegulatoryReferences = (categoryName, subcategoryName) => {
    const categoryLower = (categoryName || '').toLowerCase();
    const subcategoryLower = (subcategoryName || '').toLowerCase();
    let regulatoryReferences = [];
    
    if (categoryLower.includes('data') || categoryLower.includes('privacy') || subcategoryLower.includes('gdpr') || subcategoryLower.includes('privacy')) {
      regulatoryReferences.push(
        "GDPR Article 35 (Data Protection Impact Assessment) https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng",
        "GDPR Article 25 (Data Protection by Design and Default) https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng"
      );
    }
    
    if (categoryLower.includes('cyber') || categoryLower.includes('security') || subcategoryLower.includes('cyber') || subcategoryLower.includes('security') || subcategoryLower.includes('vulnerabilities')) {
      regulatoryReferences.push(
        "NIS2 Directive Article 21 (Cybersecurity Risk Management) https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
        "DORA Article 18 (ICT Risk Management Framework) https://eur-lex.europa.eu/eli/reg/2022/2554/oj"
      );
    }
    
    if (categoryLower.includes('ai') || categoryLower.includes('bias') || categoryLower.includes('ethics') || 
        subcategoryLower.includes('ai') || subcategoryLower.includes('bias') || subcategoryLower.includes('ethics')) {
      regulatoryReferences.push(
        "EU AI Act Article 9 (Risk Management System) https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
        "EU AI Act Article 10 (Data and Data Governance) https://eur-lex.europa.eu/eli/reg/2024/1689/oj"
      );
    }
    
    if (categoryLower.includes('compliance') || categoryLower.includes('regulatory') || 
        subcategoryLower.includes('compliance') || subcategoryLower.includes('regulatory') || subcategoryLower.includes('act')) {
      regulatoryReferences.push(
        "EU AI Act Article 16 (Quality Management System) https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
        "DORA Article 5 (Governance and Organisation) https://eur-lex.europa.eu/eli/reg/2022/2554/oj"
      );
    }
    
    if (categoryLower.includes('technical') || categoryLower.includes('implementation') || categoryLower.includes('risks') || 
        subcategoryLower.includes('technical') || subcategoryLower.includes('implementation') || subcategoryLower.includes('risks')) {
      regulatoryReferences.push(
        "NIS2 Directive Article 23 (Incident Response) https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
        "GDPR Article 32 (Security of Processing) https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng"
      );
    }
    
    if (regulatoryReferences.length === 0) {
      regulatoryReferences.push(
        "EU AI Act Article 9 (Risk Management System) https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
        "GDPR Article 35 (Data Protection Impact Assessment) https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng",
        "NIS2 Directive Article 21 (Cybersecurity Risk Management) https://eur-lex.europa.eu/eli/dir/2022/2555/oj"
      );
    }
    
    return [...new Set(regulatoryReferences)];
  };
  
  const getIndustryBestPractices = () => {
    return [
      "NIST AI RMF 1.0 - Govern Function https://airc.nist.gov/AI_RMF_Knowledge_Base",
      "OWASP AI Security Top 10 https://github.com/OWASP/www-project-ai-security-and-privacy-guide",
      "ISO 27001:2022 Information Security Management https://www.iso.org/standard/27001"
    ];
  };
  
  try {
    console.log('🔧 [UPDATE] Starting regulatory references update for existing reports...');
    
    // Get all risk assessments with empty regulatory references
    const assessmentsToUpdate = await prisma.riskAssessment.findMany({
      where: {
        OR: [
          { regulatoryReferences: { equals: [] } },
          { industryBestPractices: { equals: [] } }
        ]
      },
      select: {
        id: true,
        categoryName: true,
        subcategoryName: true,
        regulatoryReferences: true,
        industryBestPractices: true
      }
    });
    
    console.log(`📊 [UPDATE] Found ${assessmentsToUpdate.length} assessments to update`);
    
    let updatedCount = 0;
    
    for (const assessment of assessmentsToUpdate) {
      const newRegulatoryReferences = mapRegulatoryReferences(assessment.categoryName, assessment.subcategoryName);
      const newIndustryBestPractices = getIndustryBestPractices();
      
      await prisma.riskAssessment.update({
        where: { id: assessment.id },
        data: {
          regulatoryReferences: newRegulatoryReferences,
          industryBestPractices: newIndustryBestPractices
        }
      });
      
      console.log(`✅ [UPDATE] Updated ${assessment.subcategoryName} - RegRefs: ${newRegulatoryReferences.length}, BestPractices: ${newIndustryBestPractices.length}`);
      updatedCount++;
    }
    
    console.log(`🎉 [UPDATE] Successfully updated ${updatedCount} risk assessments with regulatory compliance mapping!`);
    
  } catch (error) {
    console.error('❌ [UPDATE] Error updating regulatory references:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingReports();
