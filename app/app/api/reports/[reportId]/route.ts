
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    // Fetch report with associated risk assessments
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        assessments: {
          orderBy: { riskScore: 'desc' }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Calculate risk distribution
    const riskDistribution = report.assessments.reduce((acc, assessment) => {
      acc[assessment.riskLevel] = (acc[assessment.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category distribution
    const categoryDistribution = report.assessments.reduce((acc, assessment) => {
      acc[assessment.categoryName] = (acc[assessment.categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get all risks sorted by score (comprehensive analysis)
    const allRisksSorted = report.assessments
      .sort((a, b) => b.riskScore - a.riskScore);
    
    // Get critical risks (high and extreme risk levels)
    const criticalRisks = report.assessments
      .filter(risk => ['high', 'extreme'].includes(risk.riskLevel))
      .sort((a, b) => b.riskScore - a.riskScore);
    
    // Get risks by category for comprehensive view
    const risksByCategory = report.assessments.reduce((acc, risk) => {
      if (!acc[risk.categoryName]) {
        acc[risk.categoryName] = [];
      }
      acc[risk.categoryName].push(risk);
      return acc;
    }, {} as Record<string, typeof report.assessments>);
    
    // Sort risks within each category by score
    Object.keys(risksByCategory).forEach(category => {
      risksByCategory[category].sort((a, b) => b.riskScore - a.riskScore);
    });

    const response = NextResponse.json({
      report: {
        id: report.id,
        fileName: report.fileName,
        fileType: report.fileType,
        perspective: report.perspective,
        status: report.status,
        overallRiskScore: report.overallRiskScore,
        overallRiskLevel: report.overallRiskLevel,
        summary: report.summary,
        recommendations: report.recommendations,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        user: report.user
      },
      assessments: report.assessments,
      analytics: {
        totalRisks: report.assessments.length,
        riskDistribution,
        categoryDistribution,
        allRisksSorted,
        criticalRisks,
        risksByCategory,
        riskSummary: {
          extreme: report.assessments.filter(r => r.riskLevel === 'extreme').length,
          high: report.assessments.filter(r => r.riskLevel === 'high').length,
          medium: report.assessments.filter(r => r.riskLevel === 'medium').length,
          low: report.assessments.filter(r => r.riskLevel === 'low').length,
          categoriesCovered: Object.keys(risksByCategory).length,
          avgRiskScore: report.assessments.length > 0 
            ? Math.round((report.assessments.reduce((sum, r) => sum + r.riskScore, 0) / report.assessments.length) * 10) / 10
            : 0
        },
        // Keep topRisks for backward compatibility but now it's all critical risks
        topRisks: criticalRisks.length > 0 ? criticalRisks : allRisksSorted.slice(0, 10)
      }
    });

    // Add cache-busting headers to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
