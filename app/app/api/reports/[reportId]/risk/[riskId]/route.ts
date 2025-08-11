
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string; riskId: string } }
) {
  try {
    const { reportId, riskId } = params;

    if (!reportId || !riskId) {
      return NextResponse.json({ error: 'Report ID and Risk ID are required' }, { status: 400 });
    }

    // Fetch specific risk assessment with report details
    const riskAssessment = await prisma.riskAssessment.findFirst({
      where: { 
        id: riskId,
        reportId: reportId 
      },
      include: {
        report: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            perspective: true,
            status: true,
            overallRiskScore: true,
            overallRiskLevel: true,
            createdAt: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!riskAssessment) {
      return NextResponse.json({ error: 'Risk assessment not found' }, { status: 404 });
    }

    // Get related risks from the same category for context
    const relatedRisks = await prisma.riskAssessment.findMany({
      where: {
        reportId: reportId,
        categoryName: riskAssessment.categoryName,
        id: { not: riskId }
      },
      orderBy: { riskScore: 'desc' },
      take: 3
    });

    return NextResponse.json({
      riskAssessment,
      relatedRisks
    });

  } catch (error) {
    console.error('Error fetching risk details:', error);
    return NextResponse.json({ error: 'Failed to fetch risk details' }, { status: 500 });
  }
}
