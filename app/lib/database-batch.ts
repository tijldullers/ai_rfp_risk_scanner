
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function batchCreateRiskAssessments(reportId: string, assessments: any[]) {
  if (!assessments || assessments.length === 0) {
    return;
  }

  // Prepare data for batch insert
  const assessmentData = assessments.map(assessment => ({
    reportId: reportId,
    categoryId: assessment.category_id || '',
    categoryName: assessment.category_name || '',
    subcategoryId: assessment.subcategory_id || '',
    subcategoryName: assessment.subcategory_name || '',
    riskDescription: assessment.risk_description || '',
    likelihoodScore: assessment.likelihood_score || 1,
    impactScore: assessment.impact_score || 1,
    riskScore: assessment.risk_score || 1,
    riskLevel: assessment.risk_level || 'low',
    keyFindings: assessment.key_findings || [],
    mitigationStrategies: assessment.mitigation_strategies || [],
    complianceEvidence: assessment.compliance_evidence || [],
    regulatoryMapping: assessment.regulatory_mapping || []
  }));

  // Use createMany for batch operation
  await prisma.riskAssessment.createMany({
    data: assessmentData,
    skipDuplicates: true
  });
}

export async function updateReportWithResults(reportId: string, analysisData: any) {
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'completed',
      overallRiskScore: analysisData.overall_assessment?.risk_score || 0,
      overallRiskLevel: analysisData.overall_assessment?.risk_level || 'low',
      summary: analysisData.overall_assessment?.summary || '',
      recommendations: analysisData.overall_assessment?.recommendations || ''
    }
  });
}

export async function updateReportStatus(reportId: string, status: string, message?: string) {
  const updateData: any = { status };
  if (message) {
    updateData.summary = message;
  }
  
  await prisma.report.update({
    where: { id: reportId },
    data: updateData
  });
}
