
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Shield, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface UserDashboardProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface ReportSummary {
  id: string;
  fileName: string;
  perspective: string;
  status: string;
  overallRiskLevel: string;
  overallRiskScore: number;
  createdAt: string;
  assessmentsCount: number;
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    highRiskReports: 0,
    avgRiskScore: 0,
    recentReports: 0
  });

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      const response = await fetch('/api/user/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name || 'User'}!</h1>
            <p className="text-gray-600">Discover hidden AI risks in your tender document analysis</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name || 'User'}!</h1>
          <p className="text-gray-600">Discover hidden AI risks in your tender document analysis</p>
        </div>
        <Link href="/">
          <Button className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>New Analysis</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highRiskReports}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRiskScore.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentReports}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Your Hidden Connections Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis yet</h3>
              <p className="text-gray-600 mb-6">
                Upload your first tender document to discover hidden AI risks and compliance insights
              </p>
              <Link href="/">
                <Button className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Upload Tender Document</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.fileName}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {report.perspective} perspective
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        {report.status === 'completed' && (
                          <Badge className={getRiskLevelColor(report.overallRiskLevel)}>
                            {report.overallRiskLevel} risk
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(report.createdAt).toLocaleDateString()} • 
                        {report.assessmentsCount} risks identified
                        {report.status === 'completed' && ` • Score: ${report.overallRiskScore.toFixed(1)}/25`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/analysis/${report.id}`}>
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
