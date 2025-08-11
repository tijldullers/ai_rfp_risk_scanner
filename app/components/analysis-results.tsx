/* Cache refresh: 1754296682247 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, FileText, BarChart3, Shield, Mail, Download, CheckSquare, Award, ExternalLink } from 'lucide-react';
import { RiskChart } from '@/components/risk-chart';
import { CategoryChart } from '@/components/category-chart';
import { RiskAssessmentList } from '@/components/risk-assessment-list';
import { EmailVerificationModal } from '@/components/email-verification-modal';

interface AnalysisResultsProps {
  reportId: string;
}

interface ReportData {
  report: {
    id: string;
    fileName: string;
    fileType: string;
    perspective: string;
    status: string;
    overallRiskScore: number;
    overallRiskLevel: string;
    summary: string;
    recommendations: string;
    createdAt: string;
    updatedAt: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  assessments: Array<{
    id: string;
    categoryName: string;
    subcategoryName: string;
    riskDescription: string;
    likelihoodScore: number;
    impactScore: number;
    riskScore: number;
    riskLevel: string;
    keyFindings: string[];
    mitigationStrategies: string[];
    complianceEvidence: string[];
    regulatoryMapping: string[];
    regulatoryReferences?: string[];
    complianceEvidenceRequired?: string[];
    industryBestPractices?: string[];
    scoringTransparency?: {
      methodology: string;
      likelihoodFactors: {
        score: number;
        reasoning: string;
        evidenceFactors: Array<{
          factor: string;
          weight: 'high' | 'medium' | 'low';
          evidence: string;
          contribution: string;
        }>;
      };
      impactFactors: {
        score: number;
        reasoning: string;
        evidenceFactors: Array<{
          factor: string;
          weight: 'high' | 'medium' | 'low';
          evidence: string;
          contribution: string;
        }>;
      };
      calculationBreakdown: {
        formula: string;
        calculation: string;
        scoreInterpretation: string;
        confidenceLevel: 'high' | 'medium' | 'low';
        uncertaintyFactors: string[];
      };
      documentEvidence: {
        supportingQuotes: string[];
        contextualFactors: string[];
        assumptionsMade: string[];
      };
    };
  }>;
  analytics: {
    totalRisks: number;
    riskDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    topRisks: Array<any>;
    allRisksSorted?: Array<any>;
    criticalRisks?: Array<any>;
    risksByCategory?: Record<string, Array<any>>;
    riskSummary?: {
      extreme: number;
      high: number;
      medium: number;
      low: number;
      categoriesCovered: number;
      avgRiskScore: number;
    };
  };
  regulatoryComplianceRequirements?: {
    applicableRegulations?: Array<{
      regulation: string;
      articles: string[];
      requirements: string[];
      evidenceRequired: string[];
      penalties: string;
      officialLinks: string[];
    }>;
    complianceChecklist?: Array<{
      requirement: string;
      status: string;
      evidenceNeeded: string;
      remediationSteps: string[];
    }>;
    industryFrameworks?: Array<{
      framework: string;
      applicableControls: string[];
      implementationGuidance: string;
      evidenceRequirements: string[];
    }>;
  };
}

export function AnalysisResults({ reportId }: AnalysisResultsProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('Starting analysis...');

  useEffect(() => {
    fetchReportData();
    
    // Set up polling for analysis progress
    const pollInterval = setInterval(() => {
      fetchReportData();
    }, 2000); // Poll every 2 seconds

    // Set up timeout for analysis (8 minutes to allow for 5-minute API timeout + buffer)
    const timeout = setTimeout(() => {
      setError('Analysis timeout - Large documents may take up to 5 minutes to process. Please wait a bit longer or try uploading a smaller document.');
      setLoading(false);
    }, 8 * 60 * 1000); // 8 minutes

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [reportId]);

  const fetchReportData = async () => {
    try {
      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster = Date.now();
      const response = await fetch(`/api/reports/${reportId}?t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const reportData = await response.json();
      setData(reportData);
      
      // Update progress and message based on status
      updateProgressFromStatus(reportData.report.status);
      
      // Stop loading if analysis is complete or failed
      if (reportData.report.status === 'completed' || reportData.report.status === 'failed') {
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load analysis results');
      setLoading(false);
    }
  };

  const updateProgressFromStatus = (status: string) => {
    switch (status) {
      case 'processing':
        setProgress(10);
        setAnalysisMessage('Preparing document for analysis...');
        break;
      case 'starting':
        setProgress(5);
        setAnalysisMessage('Initializing AI risk analysis engine...');
        break;
      case 'extracting':
      case 'extracting_text':
        setProgress(15);
        setAnalysisMessage('Extracting and processing document content...');
        break;
      case 'chunking':
        setProgress(25);
        setAnalysisMessage('Optimizing document structure for analysis...');
        break;
      case 'analyzing':
      case 'analyzing_risks':
        setProgress(35);
        setAnalysisMessage('Performing deep AI risk analysis (this may take several minutes for large documents)...');
        break;
      case 'analyzing_chunk':
        setProgress(Math.min(75, 35 + Math.random() * 40));
        setAnalysisMessage('Analyzing document sections and identifying risks...');
        break;
      case 'chunk_completed':
        setProgress(Math.min(80, 40 + Math.random() * 40));
        setAnalysisMessage('Processing comprehensive risk assessment...');
        break;
      case 'combining':
        setProgress(85);
        setAnalysisMessage('Finalizing risk analysis and generating recommendations...');
        break;
      case 'saving':
        setProgress(95);
        setAnalysisMessage('Saving comprehensive risk assessment...');
        break;
      case 'completed':
        setProgress(100);
        setAnalysisMessage('Analysis completed successfully!');
        break;
      case 'failed':
        setProgress(0);
        setAnalysisMessage('Analysis failed - please try again');
        break;
      default:
        setProgress(5);
        setAnalysisMessage('Starting comprehensive AI risk analysis...');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Risk Analysis</h2>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-indigo-600 font-medium">{progress}% Complete</p>
          </div>
          <p className="text-gray-600 mb-2">
            {analysisMessage}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Analyzing against 831 risk mitigation strategies from MIT taxonomy
          </p>
          <p className="text-xs text-gray-400">
            Production documents may take up to 5 minutes to process
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load analysis results'}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const { report, assessments, analytics } = data;

  if (report.status === 'processing' || report.status === 'analyzing' || 
      report.status === 'extracting_text' || report.status === 'analyzing_risks') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Risk Analysis</h2>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-indigo-600 font-medium">{progress}% Complete</p>
          </div>
          <p className="text-gray-600 mb-2">
            {analysisMessage}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Analyzing against 831 risk mitigation strategies from MIT taxonomy
          </p>
          <p className="text-xs text-gray-400">
            Production documents may take up to 5 minutes to process
          </p>
        </div>
      </div>
    );
  }

  if (report.status === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-4">
            There was an error processing your document. Please try again.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Upload New Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{report.fileName}</h1>
                <p className="text-sm text-gray-500">
                  Analysis from {report.perspective} perspective • 
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <Badge className={`${getRiskLevelColor(report.overallRiskLevel)} text-sm px-3 py-1`}>
                {report.overallRiskLevel?.toUpperCase()} RISK
              </Badge>
              <span className="text-lg font-semibold text-gray-900">
                Score: {report.overallRiskScore?.toFixed(1)}/25
              </span>
              <span className="text-sm text-gray-600">
                {analytics.totalRisks} risks identified
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Get Full Report</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {report.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Executive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">{report.summary}</p>
            {report.recommendations && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Priority Recommendations:</h4>
                <p className="text-gray-700 leading-relaxed">{report.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risks">Risk Details</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Risk Level Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RiskChart data={analytics.riskDistribution} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Risk Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart data={analytics.categoryDistribution} />
              </CardContent>
            </Card>
          </div>

          {/* Risk Summary by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Comprehensive Risk Analysis Summary</span>
                <Badge variant="outline" className="text-sm">
                  {analytics.totalRisks} Total Risks Analyzed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Risk Level Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.riskSummary?.extreme || analytics.riskDistribution?.extreme || 0}
                    </div>
                    <div className="text-sm text-red-800">Extreme Risk</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.riskSummary?.high || analytics.riskDistribution?.high || 0}
                    </div>
                    <div className="text-sm text-orange-800">High Risk</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analytics.riskSummary?.medium || analytics.riskDistribution?.medium || 0}
                    </div>
                    <div className="text-sm text-yellow-800">Medium Risk</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.riskSummary?.low || analytics.riskDistribution?.low || 0}
                    </div>
                    <div className="text-sm text-green-800">Low Risk</div>
                  </div>
                </div>

                {/* Categories Analyzed */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Risk Categories Analyzed</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium text-gray-900">{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {count} risk{count !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Risks Preview */}
                {(analytics.criticalRisks && analytics.criticalRisks.length > 0) || 
                 (analytics.topRisks && analytics.topRisks.filter(r => ['high', 'extreme'].includes(r.riskLevel)).length > 0) ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Critical & High Priority Risks</h4>
                    <div className="space-y-3">
                      {(analytics.criticalRisks || analytics.topRisks.filter(r => ['high', 'extreme'].includes(r.riskLevel))).slice(0, 6).map((risk, index) => (
                        <div key={risk.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => window.location.href = `/analysis/${reportId}/risk/${risk.id}`}>
                          <div className="flex-shrink-0">
                            <Badge variant="secondary">#{index + 1}</Badge>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{risk.subcategoryName}</h5>
                            <p className="text-xs text-gray-600 mt-1">{risk.categoryName}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={getRiskLevelColor(risk.riskLevel)}>
                                  {risk.riskLevel}
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  Score: {risk.riskScore}/25
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/analysis/${reportId}/risk/${risk.id}`;
                                }}
                              >
                                View →
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {((analytics.criticalRisks && analytics.criticalRisks.length > 6) || (analytics.topRisks && analytics.topRisks.length > 6)) && (
                      <div className="mt-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Switch to the Risk Details tab
                            const tabsList = document.querySelector('[role="tablist"]');
                            const riskTab = tabsList?.querySelector('[value="risks"]') as HTMLElement;
                            riskTab?.click();
                          }}
                          className="text-sm"
                        >
                          View All {analytics.totalRisks} Risk Assessments →
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-green-800">No critical or high-priority risks identified</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <RiskAssessmentList assessments={assessments} reportId={reportId} />
        </TabsContent>

        <TabsContent value="mitigation">
          <Card>
            <CardHeader>
              <CardTitle>Mitigation Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {assessment.subcategoryName}
                    </h4>
                    <ul className="space-y-1">
                      {assessment.mitigationStrategies.map((strategy, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            {/* New Structured Regulatory Compliance Analysis */}
            {data && data.report && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Regulatory Compliance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Display regulatory compliance from individual risk assessments */}
                    {assessments.filter(a => (a.regulatoryReferences && a.regulatoryReferences.length > 0) || (a.industryBestPractices && a.industryBestPractices.length > 0)).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk-Specific Regulatory Requirements</h3>
                        <div className="space-y-4">
                          {assessments
                            .filter(a => (a.regulatoryReferences && a.regulatoryReferences.length > 0) || (a.industryBestPractices && a.industryBestPractices.length > 0))
                            .map((assessment) => (
                              <div key={assessment.id} className="border rounded-lg p-4 space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                                  {assessment.subcategoryName}
                                </h4>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Regulatory References */}
                                  {assessment.regulatoryReferences && assessment.regulatoryReferences.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Shield className="h-3 w-3 mr-1 text-red-600" />
                                        Applicable Regulations
                                      </h5>
                                      <div className="space-y-2">
                                        {assessment.regulatoryReferences.map((regulation, index) => {
                                          const urlMatch = regulation.match(/(https?:\/\/[^\s]+)/);
                                          const hasLink = urlMatch && urlMatch[1];
                                          const text = hasLink ? regulation.replace(urlMatch[1], '').trim() : regulation;
                                          
                                          return (
                                            <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded border border-red-100">
                                              <Shield className="h-3 w-3 mt-0.5 text-red-600 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs text-red-800 font-medium">{text}</p>
                                                {hasLink && (
                                                  <a 
                                                    href={hasLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs text-red-600 hover:text-red-800 underline mt-1"
                                                  >
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    Official Source
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Industry Best Practices */}
                                  {assessment.industryBestPractices && assessment.industryBestPractices.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Award className="h-3 w-3 mr-1 text-green-600" />
                                        Industry Best Practices
                                      </h5>
                                      <div className="space-y-2">
                                        {assessment.industryBestPractices.map((practice, index) => {
                                          const urlMatch = practice.match(/(https?:\/\/[^\s]+)/);
                                          const hasLink = urlMatch && urlMatch[1];
                                          const text = hasLink ? practice.replace(urlMatch[1], '').trim() : practice;
                                          
                                          return (
                                            <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded border border-green-100">
                                              <Award className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs text-green-800 font-medium">{text}</p>
                                                {hasLink && (
                                                  <a 
                                                    href={hasLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs text-green-600 hover:text-green-800 underline mt-1"
                                                  >
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    Framework Guide
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Reference to Key Regulations */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key AI Regulatory Frameworks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <a 
                          href="https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">GDPR</p>
                            <p className="text-xs text-gray-600">Data Protection</p>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                        </a>
                        
                        <a 
                          href="https://eur-lex.europa.eu/eli/dir/2022/2555/oj" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">NIS2</p>
                            <p className="text-xs text-gray-600">Cybersecurity</p>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                        </a>
                        
                        <a 
                          href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">EU AI Act</p>
                            <p className="text-xs text-gray-600">AI Regulation</p>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                        </a>
                        
                        <a 
                          href="https://airc.nist.gov/AI_RMF_Knowledge_Base" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                        >
                          <Award className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">NIST AI RMF</p>
                            <p className="text-xs text-gray-600">Risk Management</p>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                        </a>
                        
                        <a 
                          href="https://github.com/OWASP/www-project-ai-security-and-privacy-guide" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                        >
                          <Award className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">OWASP AI Security</p>
                            <p className="text-xs text-gray-600">Security Guide</p>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                        </a>
                        
                        <a 
                          href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">DORA</p>
                            <p className="text-xs text-gray-600">Financial Resilience</p>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Regulatory Compliance Requirements (fallback for legacy data) */}
            {data?.regulatoryComplianceRequirements && (
              <>
                {/* Applicable Regulations */}
                {data.regulatoryComplianceRequirements.applicableRegulations && data.regulatoryComplianceRequirements.applicableRegulations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        Applicable Regulations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {data.regulatoryComplianceRequirements.applicableRegulations.map((regulation, index) => (
                          <div key={index} className="border-l-4 border-red-500 pl-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {regulation.regulation}
                              </h4>
                              <Badge variant="destructive" className="ml-2">
                                {regulation.penalties}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Articles:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {regulation.articles.map((article, articleIndex) => (
                                    <Badge key={articleIndex} variant="outline" className="text-xs">
                                      {article}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Official Links:</h5>
                                <div className="space-y-1">
                                  {regulation.officialLinks.map((link, linkIndex) => (
                                    <a 
                                      key={linkIndex} 
                                      href={link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 underline block truncate"
                                    >
                                      {link}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h5>
                              <ul className="space-y-1">
                                {regulation.requirements.map((requirement, reqIndex) => (
                                  <li key={reqIndex} className="text-sm text-gray-600">
                                    • {requirement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence Required:</h5>
                              <ul className="space-y-1">
                                {regulation.evidenceRequired.map((evidence, evidenceIndex) => (
                                  <li key={evidenceIndex} className="text-sm text-gray-600">
                                    • {evidence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Checklist */}
                {data.regulatoryComplianceRequirements.complianceChecklist && data.regulatoryComplianceRequirements.complianceChecklist.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-blue-500" />
                        Compliance Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data.regulatoryComplianceRequirements.complianceChecklist.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900">
                                {item.requirement}
                              </h4>
                              <Badge 
                                variant={
                                  item.status === 'compliant' ? 'default' :
                                  item.status === 'non-compliant' ? 'destructive' : 'secondary'
                                }
                                className="ml-2"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence Needed:</h5>
                              <p className="text-sm text-gray-600">{item.evidenceNeeded}</p>
                            </div>
                            
                            {item.remediationSteps.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Remediation Steps:</h5>
                                <ul className="space-y-1">
                                  {item.remediationSteps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="text-sm text-gray-600">
                                      {stepIndex + 1}. {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Industry Frameworks */}
                {data.regulatoryComplianceRequirements.industryFrameworks && data.regulatoryComplianceRequirements.industryFrameworks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-500" />
                        Industry Best Practices & Frameworks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {data.regulatoryComplianceRequirements.industryFrameworks.map((framework, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4 space-y-3">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {framework.framework}
                            </h4>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Applicable Controls:</h5>
                              <div className="flex flex-wrap gap-1">
                                {framework.applicableControls.map((control, controlIndex) => (
                                  <Badge key={controlIndex} variant="outline" className="text-xs">
                                    {control}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Implementation Guidance:</h5>
                              <p className="text-sm text-gray-600">{framework.implementationGuidance}</p>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence Requirements:</h5>
                              <ul className="space-y-1">
                                {framework.evidenceRequirements.map((evidence, evidenceIndex) => (
                                  <li key={evidenceIndex} className="text-sm text-gray-600">
                                    • {evidence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Individual Risk Assessment Compliance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Risk-Specific Compliance Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="space-y-3 border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold text-gray-900">
                        {assessment.subcategoryName}
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Required Evidence:</h5>
                          <ul className="space-y-1">
                            {assessment.complianceEvidence?.map((evidence, index) => (
                              <li key={index} className="text-sm text-gray-600">• {evidence}</li>
                            ))}
                            {assessment.complianceEvidenceRequired?.map((evidence, index) => (
                              <li key={index} className="text-sm text-gray-600">• {evidence}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Regulatory References:</h5>
                          <div className="flex flex-wrap gap-1">
                            {assessment.regulatoryMapping?.map((regulation, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{regulation}</Badge>
                            ))}
                            {assessment.regulatoryReferences?.map((reference, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{reference}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Industry Best Practices:</h5>
                          <ul className="space-y-1">
                            {assessment.industryBestPractices?.map((practice, index) => (
                              <li key={index} className="text-sm text-gray-600">• {practice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        reportId={reportId}
      />
    </div>
  );
}
