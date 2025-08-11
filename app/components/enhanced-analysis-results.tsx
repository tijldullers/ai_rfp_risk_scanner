
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, FileText, BarChart3, Shield, Mail, Download, CheckSquare, Award, Clock, Brain, Database, CheckCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskChart } from '@/components/risk-chart';
import { CategoryChart } from '@/components/category-chart';
import { RiskAssessmentList } from '@/components/risk-assessment-list';
import { EmailVerificationModal } from '@/components/email-verification-modal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import React from 'react';

interface ProgressUpdate {
  step: string;
  message: string;
  progress: number;
  timestamp: string;
  phase: string;
  estimatedTimeRemaining?: string;
  details?: string[];
  error?: boolean;
}

interface EnhancedAnalysisResultsProps {
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
    scoringTransparency?: any;
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
  regulatoryComplianceRequirements?: any;
  consistencyValidation?: {
    completenessScore: number;
    systematicScore: number;
    comprehensivenessScore: number;
    overallScore: number;
    missingCategories: string[];
    recommendations: string[];
  };
}

const PHASE_ICONS = {
  'Document Validation': FileText,
  'File Type Detection': FileText,
  'Content Extraction': FileText,
  'Document Analysis': FileText,
  'Risk Context Loading': Shield,
  'AI Risk Assessment': Brain,
  'Result Processing': Database,
  'Database Storage': Database,
  'Final Report Generation': CheckCircle,
  'Error': AlertTriangle
};

export function EnhancedAnalysisResults({ reportId }: EnhancedAnalysisResultsProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Enhanced progress tracking state
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('Initializing');
  const [currentMessage, setCurrentMessage] = useState('Starting analysis...');
  const [estimatedTime, setEstimatedTime] = useState('Calculating...');
  const [progressHistory, setProgressHistory] = useState<ProgressUpdate[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showDetailedLog, setShowDetailedLog] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchReportData();
    
    // Set up polling for analysis progress
    const pollInterval = setInterval(() => {
      if (!isCompleted && !hasError) {
        fetchReportData();
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [reportId, isCompleted, hasError]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const reportData = await response.json();
      setData(reportData);
      
      // Update progress based on report status
      updateProgressFromStatus(reportData.report.status);
      
      if (reportData.report.status === 'completed') {
        setIsCompleted(true);
        setProgress(100);
        setCurrentPhase('Analysis Complete');
        setCurrentMessage('Risk assessment completed successfully!');
        setLoading(false);
      } else if (reportData.report.status === 'failed') {
        setHasError(true);
        setCurrentPhase('Error');
        setCurrentMessage('Analysis failed - please try again');
        setError('Analysis failed - please try again');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load analysis results');
      setHasError(true);
      setLoading(false);
    }
  };

  const updateProgressFromStatus = (status: string) => {
    const timestamp = new Date().toISOString();
    let update: ProgressUpdate;

    switch (status) {
      case 'processing':
        update = {
          step: 'processing',
          message: 'Processing document and preparing for analysis...',
          progress: 15,
          timestamp,
          phase: 'Document Processing',
          estimatedTimeRemaining: '2-3 minutes',
          details: [
            'Document uploaded successfully',
            'Validating file format and content',
            'Preparing for AI risk analysis'
          ]
        };
        break;
      case 'analyzing':
        update = {
          step: 'analyzing',
          message: 'Performing comprehensive AI risk analysis...',
          progress: 60,
          timestamp,
          phase: 'AI Risk Assessment',
          estimatedTimeRemaining: '1-2 minutes',
          details: [
            'Analyzing document content for AI risks',
            'Applying 831 MIT risk mitigation strategies',
            'Generating transparency and scoring data',
            'This is the most intensive phase of analysis'
          ]
        };
        break;
      case 'saving':
        update = {
          step: 'saving',
          message: 'Saving comprehensive analysis results...',
          progress: 95,
          timestamp,
          phase: 'Database Storage',
          estimatedTimeRemaining: '10-20 seconds',
          details: [
            'Storing risk assessments with transparency data',
            'Saving compliance mappings and recommendations',
            'Finalizing report structure'
          ]
        };
        break;
      case 'completed':
        update = {
          step: 'completed',
          message: 'Analysis completed successfully!',
          progress: 100,
          timestamp,
          phase: 'Analysis Complete',
          estimatedTimeRemaining: '0s remaining',
          details: [
            'Comprehensive risk assessment completed',
            'All transparency data available',
            'Ready for review and action'
          ]
        };
        break;
      case 'failed':
        update = {
          step: 'failed',
          message: 'Analysis failed - please try again',
          progress: 0,
          timestamp,
          phase: 'Error',
          error: true,
          details: [
            'Analysis encountered an error',
            'Please try uploading the document again',
            'Contact support if the issue persists'
          ]
        };
        break;
      default:
        update = {
          step: 'starting',
          message: 'Initializing AI risk analysis engine...',
          progress: 5,
          timestamp,
          phase: 'Initialization',
          estimatedTimeRemaining: 'Calculating...',
          details: [
            'Starting comprehensive risk analysis',
            'Loading AI risk assessment frameworks',
            'Preparing document processing pipeline'
          ]
        };
    }

    updateProgress(update);
  };



  const updateProgress = (update: ProgressUpdate) => {
    setProgress(update.progress);
    setCurrentPhase(update.phase);
    setCurrentMessage(update.message);
    if (update.estimatedTimeRemaining) {
      setEstimatedTime(update.estimatedTimeRemaining);
    }
    
    setProgressHistory(prev => [...prev, update]);
  };

  const getPhaseIcon = (phase: string) => {
    const IconComponent = PHASE_ICONS[phase as keyof typeof PHASE_ICONS] || Loader2;
    return IconComponent;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const elapsed = Math.round((date.getTime() - startTime) / 1000);
    return `${elapsed}s`;
  };

  const getProgressColor = () => {
    if (hasError) return 'bg-red-500';
    if (isCompleted) return 'bg-green-500';
    return 'bg-indigo-600';
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

  // Enhanced Progress UI
  if (loading && !isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : hasError ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                )}
                <span>{isCompleted ? 'Analysis Complete' : hasError ? 'Analysis Failed' : 'AI Risk Analysis'}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Report ID: {reportId.slice(-8)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasError ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Analysis Failed</span>
                </div>
                <p className="text-gray-700">{error || currentMessage}</p>
                <Button onClick={() => window.location.href = '/'} className="w-full">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Current Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {React.createElement(getPhaseIcon(currentPhase), {
                        className: `h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-indigo-600'} ${!isCompleted && 'animate-pulse'}`
                      })}
                      <span className="font-medium text-gray-900">{currentPhase}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{estimatedTime}</span>
                      </div>
                      <span className="font-medium">{progress}%</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <p className="text-gray-700 font-medium">{currentMessage}</p>
                </div>

                {/* Current Details */}
                {progressHistory.length > 0 && progressHistory[progressHistory.length - 1].details && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Current Operations:</span>
                    </h4>
                    <ul className="space-y-1">
                      {progressHistory[progressHistory.length - 1].details?.map((detail, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Log */}
                {progressHistory.length > 0 && (
                  <Collapsible open={showDetailedLog} onOpenChange={setShowDetailedLog}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Detailed Progress Log ({progressHistory.length} steps)</span>
                        </span>
                        {showDetailedLog ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-4">
                      <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          {progressHistory.map((update, index) => (
                            <div key={index} className="border-l-2 border-indigo-200 pl-4 pb-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  {React.createElement(getPhaseIcon(update.phase), {
                                    className: `h-4 w-4 ${update.error ? 'text-red-500' : 'text-indigo-500'}`
                                  })}
                                  <span className="font-medium text-sm text-gray-900">{update.phase}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {update.progress}%
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>+{formatTimestamp(update.timestamp)}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{update.message}</p>
                              {update.details && update.details.length > 0 && (
                                <ul className="space-y-1">
                                  {update.details.map((detail, detailIndex) => (
                                    <li key={detailIndex} className="text-xs text-gray-600 flex items-start space-x-2">
                                      <span className="text-indigo-400 mt-0.5">→</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Analysis Statistics */}
                {progressHistory.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{progressHistory.length}</div>
                      <div className="text-xs text-indigo-800">Processing Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {Math.round((Date.now() - startTime) / 1000)}s
                      </div>
                      <div className="text-xs text-indigo-800">Elapsed Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{progress}%</div>
                      <div className="text-xs text-indigo-800">Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {new Set(progressHistory.map(h => h.phase)).size}
                      </div>
                      <div className="text-xs text-indigo-800">Phases Complete</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
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

  // Rest of the component remains the same as the original analysis-results.tsx
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
              <span>Email This Report</span>
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

          {/* Critical Risks Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Critical Risks Overview</span>
                <Badge variant="outline" className="text-sm">
                  {analytics.criticalRisks?.length || analytics.topRisks?.length || 0} High-Priority Risks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {((analytics.criticalRisks?.length ?? 0) > 0 ? (analytics.criticalRisks ?? []) : (analytics.topRisks ?? [])).slice(0, 8).map((risk, index) => (
                  <div key={risk.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => window.location.href = `/analysis/${reportId}/risk/${risk.id}`}>
                    <div className="flex-shrink-0">
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{risk.subcategoryName}</h4>
                          <p className="text-xs text-gray-500 mb-1">{risk?.categoryName ?? 'Unknown Category'}</p>
                          <p className="text-sm text-gray-600 mt-1">{risk?.riskDescription ?? 'No description available'}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1 ml-4">
                          <Badge className={getRiskLevelColor(risk.riskLevel)}>
                            {risk.riskLevel.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-semibold text-gray-900">
                            {risk.riskScore}/25
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            Likelihood: {risk.likelihoodScore} × Impact: {risk.impactScore}
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
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {((analytics.criticalRisks?.length ?? 0) > 8 || (analytics.topRisks?.length || 0) > 8) && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      +{((analytics.criticalRisks?.length || analytics.topRisks?.length || 0) - 8)} more critical risks identified
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = `/analysis/${reportId}?tab=risks`}>
                      View All Risks
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Risk Summary */}
          {analytics.riskSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Comprehensive Risk Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{analytics.riskSummary.extreme || 0}</div>
                    <div className="text-sm text-red-800">Extreme Risk</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analytics.riskSummary.high || 0}</div>
                    <div className="text-sm text-orange-800">High Risk</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.riskSummary.medium || 0}</div>
                    <div className="text-sm text-yellow-800">Medium Risk</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.riskSummary.low || 0}</div>
                    <div className="text-sm text-green-800">Low Risk</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-indigo-600">{analytics.riskSummary.categoriesCovered || 0}</div>
                    <div className="text-sm text-gray-600">Risk Categories Analyzed</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-indigo-600">{analytics.riskSummary.avgRiskScore || 0}</div>
                    <div className="text-sm text-gray-600">Average Risk Score</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-indigo-600">{analytics.totalRisks}</div>
                    <div className="text-sm text-gray-600">Total Risks Identified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consistency Validation */}
          {data?.consistencyValidation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Analysis Quality & Consistency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                      data.consistencyValidation.overallScore >= 85 ? 'bg-green-100 text-green-800' :
                      data.consistencyValidation.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.consistencyValidation.overallScore}
                    </div>
                    <p className="text-sm font-medium mt-2">Overall Score</p>
                    <p className="text-xs text-gray-600">Consistency & Quality</p>
                  </div>

                  {/* Completeness Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                      data.consistencyValidation.completenessScore >= 90 ? 'bg-green-100 text-green-800' :
                      data.consistencyValidation.completenessScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.consistencyValidation.completenessScore}
                    </div>
                    <p className="text-sm font-medium mt-2">Completeness</p>
                    <p className="text-xs text-gray-600">Category Coverage</p>
                  </div>

                  {/* Systematic Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                      data.consistencyValidation.systematicScore >= 85 ? 'bg-green-100 text-green-800' :
                      data.consistencyValidation.systematicScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.consistencyValidation.systematicScore}
                    </div>
                    <p className="text-sm font-medium mt-2">Systematic</p>
                    <p className="text-xs text-gray-600">Analysis Depth</p>
                  </div>

                  {/* Comprehensiveness Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                      data.consistencyValidation.comprehensivenessScore >= 85 ? 'bg-green-100 text-green-800' :
                      data.consistencyValidation.comprehensivenessScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.consistencyValidation.comprehensivenessScore}
                    </div>
                    <p className="text-sm font-medium mt-2">Comprehensive</p>
                    <p className="text-xs text-gray-600">Risk Coverage</p>
                  </div>
                </div>

                {/* Missing Categories Alert */}
                {data.consistencyValidation.missingCategories.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Missing Risk Categories</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          The following mandatory risk categories were not fully evaluated:
                        </p>
                        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                          {data.consistencyValidation.missingCategories.map((category, index) => (
                            <li key={index}>{category}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {data.consistencyValidation.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Quality Recommendations</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          {data.consistencyValidation.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Excellence Badge */}
                {data.consistencyValidation.overallScore >= 85 && (
                  <div className="mt-4 text-center">
                    <Badge className="bg-green-100 text-green-800 px-4 py-2">
                      <Award className="h-4 w-4 mr-2" />
                      High-Quality Systematic Analysis
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          {/* Comprehensive Risk Categories View */}
          {analytics.risksByCategory && Object.keys(analytics.risksByCategory).length > 0 ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">Comprehensive Risk Analysis</h3>
                <p className="text-sm text-indigo-800">
                  All {analytics.totalRisks} identified risks organized by category. Each risk includes detailed scoring transparency and evidence-based assessment.
                </p>
              </div>
              
              {Object.entries(analytics.risksByCategory).map(([category, risks]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-sm">
                          {risks.length} {risks.length === 1 ? 'Risk' : 'Risks'}
                        </Badge>
                        <Badge className={
                          risks.some(r => r.riskLevel === 'extreme') ? 'bg-red-100 text-red-800' :
                          risks.some(r => r.riskLevel === 'high') ? 'bg-orange-100 text-orange-800' :
                          risks.some(r => r.riskLevel === 'medium') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {risks.some(r => r.riskLevel === 'extreme') ? 'EXTREME' :
                           risks.some(r => r.riskLevel === 'high') ? 'HIGH' :
                           risks.some(r => r.riskLevel === 'medium') ? 'MEDIUM' : 'LOW'} Priority
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RiskAssessmentList assessments={risks} reportId={reportId} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Fallback to original view if risksByCategory is not available
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">All Risk Assessments</h3>
                <p className="text-sm text-indigo-800">
                  Complete list of all {analytics.totalRisks} identified risks with detailed analysis and scoring transparency.
                </p>
              </div>
              <RiskAssessmentList assessments={assessments} reportId={reportId} />
            </div>
          )}
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
            {/* Compliance content remains the same */}
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Show actual compliance analysis */}
                  {data?.regulatoryComplianceRequirements ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-700">
                        <p className="mb-4">Complete regulatory compliance analysis based on identified risks:</p>
                        
                        {/* Risk-specific compliance */}
                        {data.regulatoryComplianceRequirements.riskSpecificRequiredEvidence && data.regulatoryComplianceRequirements.riskSpecificRequiredEvidence.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Risk-Specific Compliance Requirements:</h4>
                            <ul className="space-y-1 pl-4">
                              {data.regulatoryComplianceRequirements.riskSpecificRequiredEvidence.map((evidence: string, index: number) => (
                                <li key={index} className="text-gray-700">• {evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Regulatory references */}
                        {data.regulatoryComplianceRequirements.riskSpecificRegulatoryReferences && data.regulatoryComplianceRequirements.riskSpecificRegulatoryReferences.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Applicable Regulations:</h4>
                            <div className="flex flex-wrap gap-2">
                              {data.regulatoryComplianceRequirements.riskSpecificRegulatoryReferences.map((regulation: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {regulation}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Industry best practices */}
                        {data.regulatoryComplianceRequirements.riskSpecificIndustryBestPractices && data.regulatoryComplianceRequirements.riskSpecificIndustryBestPractices.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Industry Best Practices:</h4>
                            <ul className="space-y-1 pl-4">
                              {data.regulatoryComplianceRequirements.riskSpecificIndustryBestPractices.map((practice: string, index: number) => (
                                <li key={index} className="text-gray-700">• {practice}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700 mb-4">Complete compliance analysis based on risk assessments:</p>
                      
                      {/* Show compliance from individual risk assessments */}
                      {assessments && assessments.length > 0 ? (
                        <div className="space-y-4">
                          {assessments.map((assessment, index) => (
                            <div key={assessment.id} className="border-l-4 border-indigo-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{assessment.subcategoryName}</h4>
                              
                              {/* Regulatory references */}
                              {assessment.regulatoryReferences && assessment.regulatoryReferences.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-800">Regulations: </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {assessment.regulatoryReferences.map((regulation, regIndex) => (
                                      <Badge key={regIndex} variant="outline" className="text-xs">
                                        {regulation}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Industry best practices */}
                              {assessment.industryBestPractices && assessment.industryBestPractices.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-800">Best Practices: </span>
                                  <ul className="text-sm text-gray-600 mt-1">
                                    {assessment.industryBestPractices.slice(0, 3).map((practice, practiceIndex) => (
                                      <li key={practiceIndex}>• {practice}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Compliance evidence */}
                              {assessment.complianceEvidence && assessment.complianceEvidence.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-800">Required Evidence: </span>
                                  <ul className="text-sm text-gray-600 mt-1">
                                    {assessment.complianceEvidence.slice(0, 2).map((evidence, evidenceIndex) => (
                                      <li key={evidenceIndex}>• {evidence}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No specific compliance requirements identified for this analysis.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailVerificationModal 
          isOpen={showEmailModal}
          reportId={reportId}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
