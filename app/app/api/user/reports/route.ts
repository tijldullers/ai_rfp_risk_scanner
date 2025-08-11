
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user reports with assessment counts
    const reports = await prisma.report.findMany({
      where: { userId: session.user.id },
      include: {
        assessments: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const completedReports = reports.filter(r => r.status === 'completed');
    const highRiskReports = completedReports.filter(r => r.overallRiskLevel === 'high' || r.overallRiskLevel === 'extreme');
    const avgRiskScore = completedReports.length > 0 
      ? completedReports.reduce((sum, r) => sum + (r.overallRiskScore || 0), 0) / completedReports.length 
      : 0;
    
    const currentMonth = new Date();
    const recentReports = reports.filter(r => {
      const reportDate = new Date(r.createdAt);
      return reportDate.getMonth() === currentMonth.getMonth() && 
             reportDate.getFullYear() === currentMonth.getFullYear();
    }).length;

    const reportSummaries = reports.map(report => ({
      id: report.id,
      fileName: report.fileName,
      perspective: report.perspective,
      status: report.status,
      overallRiskLevel: report.overallRiskLevel || 'unknown',
      overallRiskScore: report.overallRiskScore || 0,
      createdAt: report.createdAt.toISOString(),
      assessmentsCount: report.assessments.length
    }));

    return NextResponse.json({
      reports: reportSummaries,
      stats: {
        totalReports: reports.length,
        highRiskReports: highRiskReports.length,
        avgRiskScore,
        recentReports
      }
    });

  } catch (error) {
    console.error('Error fetching user reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
