
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Shield, 
  Calculator, 
  Target,
  TrendingUp,
  Quote,
  FileText,
  Award,
  BarChart3,
  Info,
  CheckCircle,
  Loader2,
  Eye,
  Lightbulb,
  Search,
  MapPin,
  Book
} from 'lucide-react';

interface RiskAssessment {
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
  regulatoryReferences: string[];
  industryBestPractices: string[];
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
  documentEvidence?: {
    triggering_phrases: Array<{
      text: string;
      location: string;
      context: string;
    }>;
    risk_reasoning: string;
    mitigation_reasoning: string;
    confidence_indicators: string[];
    uncertainty_factors: string[];
  };
  createdAt: string;
  report: {
    id: string;
    fileName: string;
    fileType: string;
    perspective: string;
    status: string;
    overallRiskScore: number;
    overallRiskLevel: string;
    createdAt: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface RiskDetailsData {
  riskAssessment: RiskAssessment;
  relatedRisks: Array<{
    id: string;
    subcategoryName: string;
    riskScore: number;
    riskLevel: string;
  }>;
}

interface RiskDetailsViewProps {
  reportId: string;
  riskId: string;
}

export function RiskDetailsView({ reportId, riskId }: RiskDetailsViewProps) {
  const [data, setData] = useState<RiskDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRiskDetails();
  }, [reportId, riskId]);

  const fetchRiskDetails = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}/risk/${riskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch risk details');
      }
      const riskData = await response.json();
      setData(riskData);
    } catch (err) {
      setError('Failed to load risk details');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWeightColor = (weight: 'high' | 'medium' | 'low') => {
    switch (weight) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'extreme':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading risk details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Risk Details</h2>
          <p className="text-gray-600 mb-4">{error || 'Risk details not found'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { riskAssessment, relatedRisks } = data;
  const { scoringTransparency } = riskAssessment;

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/analysis/${reportId}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analysis</span>
        </Button>
        <div className="text-sm text-gray-500">
          <span>{riskAssessment.report.fileName}</span>
          <span className="mx-2">•</span>
          <span>{riskAssessment.categoryName}</span>
        </div>
      </div>

      {/* Risk Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg border ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                {getRiskIcon(riskAssessment.riskLevel)}
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  {riskAssessment.subcategoryName}
                </CardTitle>
                <p className="text-lg text-gray-600 mb-2">{riskAssessment.categoryName}</p>
                <p className="text-gray-700 leading-relaxed max-w-3xl">
                  {riskAssessment.riskDescription}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge className={`${getRiskLevelColor(riskAssessment.riskLevel)} text-lg px-4 py-2`}>
                {riskAssessment.riskLevel.toUpperCase()} RISK
              </Badge>
              <div className="text-3xl font-bold text-gray-900">
                {riskAssessment.riskScore}/25
              </div>
              <div className="text-sm text-gray-600">
                Likelihood: {riskAssessment.likelihoodScore} × Impact: {riskAssessment.impactScore}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Details Tabs */}
      <Tabs defaultValue="evidence-reasoning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="evidence-reasoning">Evidence & Reasoning</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
          <TabsTrigger value="evidence">Legacy Evidence</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="related">Related Risks</TabsTrigger>
        </TabsList>

        {/* Evidence & Reasoning Tab */}
        <TabsContent value="evidence-reasoning" className="space-y-6">
          {riskAssessment.documentEvidence ? (
            <div className="space-y-6">
              {/* Document Evidence with Triggering Phrases */}
              {riskAssessment.documentEvidence.triggering_phrases && riskAssessment.documentEvidence.triggering_phrases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span>Document Sections That Triggered This Risk</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {riskAssessment.documentEvidence.triggering_phrases.map((phrase, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="bg-white border-blue-200 text-blue-800">
                            {phrase.location || `Section ${index + 1}`}
                          </Badge>
                        </div>
                        <blockquote className="text-blue-900 italic mb-3 pl-4 border-l-2 border-blue-300">
                          "{phrase.text}"
                        </blockquote>
                        <div className="bg-blue-100 p-3 rounded">
                          <h5 className="font-medium text-blue-900 mb-1">Why this indicates risk:</h5>
                          <p className="text-blue-800 text-sm">{phrase.context}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Risk Classification Reasoning */}
              {riskAssessment.documentEvidence.risk_reasoning && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="h-5 w-5 text-green-600" />
                      <span>Risk Classification Reasoning</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-900 leading-relaxed">
                        {riskAssessment.documentEvidence.risk_reasoning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mitigation Reasoning */}
              {riskAssessment.documentEvidence.mitigation_reasoning && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span>Mitigation Strategy Reasoning</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-900 leading-relaxed">
                        {riskAssessment.documentEvidence.mitigation_reasoning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Supporting Quotes Fallback - Show if triggering phrases are not available but we have scoring transparency */}
              {(!riskAssessment.documentEvidence.triggering_phrases || riskAssessment.documentEvidence.triggering_phrases.length === 0) && 
               scoringTransparency?.documentEvidence?.supportingQuotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Quote className="h-5 w-5 text-green-600" />
                      <span>Supporting Quotes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const quotes = (scoringTransparency?.documentEvidence?.supportingQuotes ?? [])
                        .filter((quote: string) => quote && quote.trim() !== '' && quote !== '...' && !quote.includes('Risk identified through document analysis'));
                      
                      if (quotes.length > 0) {
                        return quotes.map((quote: string, index: number) => (
                          <blockquote key={index} className="bg-green-50 p-4 border-l-4 border-green-500 text-green-900 italic">
                            "{quote}"
                          </blockquote>
                        ));
                      } else {
                        return (
                          <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-yellow-800">
                            <p className="text-sm font-medium mb-1">No specific document quotes available</p>
                            <p className="text-xs">This risk assessment may have been generated without extracting specific quotes from the source document. Re-analyze the document to get enhanced evidence with actual document quotes.</p>
                          </div>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Confidence and Uncertainty Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Confidence Indicators */}
                {riskAssessment.documentEvidence.confidence_indicators && riskAssessment.documentEvidence.confidence_indicators.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Confidence Indicators</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {riskAssessment.documentEvidence.confidence_indicators.map((indicator, index) => (
                          <li key={index} className="text-gray-700 flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Uncertainty Factors */}
                {riskAssessment.documentEvidence.uncertainty_factors && riskAssessment.documentEvidence.uncertainty_factors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-yellow-600" />
                        <span>Uncertainty Factors</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {riskAssessment.documentEvidence.uncertainty_factors.map((factor, index) => (
                          <li key={index} className="text-gray-700 flex items-start">
                            <span className="text-yellow-600 mr-2">⚠</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Book className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Enhanced Evidence & Reasoning</p>
                  <p className="text-sm">This detailed evidence analysis is available for newly generated risk assessments.</p>
                  <p className="text-sm mt-2">Reanalyze your document to get enhanced evidence tracking with specific document sections and reasoning.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transparency Tab */}
        <TabsContent value="transparency" className="space-y-6">
          {scoringTransparency ? (
            <>
              {/* Methodology */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Scoring Methodology</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900">{scoringTransparency.methodology}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Calculation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-indigo-600" />
                    <span>Risk Score Calculation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {scoringTransparency?.likelihoodFactors?.score ?? riskAssessment?.likelihoodScore ?? 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Likelihood</div>
                      </div>
                      <div className="text-center flex items-center justify-center">
                        <span className="text-2xl text-gray-500">×</span>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {scoringTransparency?.impactFactors?.score ?? riskAssessment?.impactScore ?? 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Impact</div>
                      </div>
                      <div className="text-center flex items-center justify-center">
                        <span className="text-2xl text-gray-500">=</span>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-1">
                          {riskAssessment.riskScore}
                        </div>
                        <div className="text-sm text-gray-600">Risk Score</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Formula:</strong> {scoringTransparency?.calculationBreakdown?.formula ?? 'Risk Score = Likelihood × Impact'}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Calculation:</strong> {(scoringTransparency?.likelihoodFactors?.score ?? riskAssessment?.likelihoodScore)} × {(scoringTransparency?.impactFactors?.score ?? riskAssessment?.impactScore)} = {riskAssessment?.riskScore}
                      </p>
                      <p className="text-sm text-gray-700">
                        {scoringTransparency?.calculationBreakdown?.scoreInterpretation ?? `${riskAssessment?.riskLevel ?? 'Unknown'} risk level assessment based on likelihood and impact analysis`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Likelihood Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Likelihood Assessment</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      Score: {scoringTransparency?.likelihoodFactors?.score ?? riskAssessment?.likelihoodScore ?? 'N/A'}/5
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Reasoning</h4>
                    <p className="text-blue-800">{scoringTransparency?.likelihoodFactors?.reasoning ?? 'Likelihood assessment based on document analysis and risk factors'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Evidence Factors</h4>
                    <div className="space-y-3">
                      {(scoringTransparency?.likelihoodFactors?.evidenceFactors ?? []).map((factor: any, index: number) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">{factor.factor}</h5>
                            <Badge className={getWeightColor(factor.weight)}>
                              {factor.weight} weight
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{factor.evidence}</p>
                          <p className="text-sm text-gray-600 italic">{factor.contribution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>Impact Assessment</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      Score: {scoringTransparency?.impactFactors?.score ?? riskAssessment?.impactScore ?? 'N/A'}/5
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Reasoning</h4>
                    <p className="text-orange-800">{scoringTransparency?.impactFactors?.reasoning ?? 'Impact assessment based on potential consequences and business implications'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Evidence Factors</h4>
                    <div className="space-y-3">
                      {(scoringTransparency?.impactFactors?.evidenceFactors ?? []).map((factor: any, index: number) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">{factor.factor}</h5>
                            <Badge className={getWeightColor(factor.weight)}>
                              {factor.weight} weight
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{factor.evidence}</p>
                          <p className="text-sm text-gray-600 italic">{factor.contribution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confidence & Uncertainty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Confidence Level</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <Badge className={`${getConfidenceColor(scoringTransparency?.calculationBreakdown?.confidenceLevel ?? 'medium')} text-lg px-4 py-2`}>
                        {(scoringTransparency?.calculationBreakdown?.confidenceLevel ?? 'medium').toUpperCase()} CONFIDENCE
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      This confidence level reflects the reliability of the risk assessment based on available evidence and data quality.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="h-5 w-5 text-yellow-600" />
                      <span>Uncertainty Factors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(scoringTransparency?.calculationBreakdown?.uncertaintyFactors ?? []).length > 0 ? (
                      <ul className="space-y-2">
                        {(scoringTransparency?.calculationBreakdown?.uncertaintyFactors ?? []).map((factor: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-yellow-600 mr-2">⚠</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No significant uncertainty factors identified.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed transparency information not available for this risk assessment.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          {scoringTransparency?.documentEvidence ? (
            <div className="space-y-6">
              {/* Supporting Quotes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Quote className="h-5 w-5 text-green-600" />
                    <span>Supporting Quotes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const quotes = (scoringTransparency?.documentEvidence?.supportingQuotes ?? [])
                      .filter((quote: string) => quote && quote.trim() !== '' && quote !== '...' && !quote.includes('Risk identified through document analysis'));
                    
                    if (quotes.length > 0) {
                      return quotes.map((quote: string, index: number) => (
                        <blockquote key={index} className="bg-green-50 p-4 border-l-4 border-green-500 text-green-900 italic">
                          "{quote}"
                        </blockquote>
                      ));
                    } else {
                      return (
                        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-yellow-800">
                          <p className="text-sm font-medium mb-1">No specific document quotes available</p>
                          <p className="text-xs">This risk assessment may have been generated without extracting specific quotes from the source document. Re-analyze the document to get enhanced evidence with actual document quotes.</p>
                        </div>
                      );
                    }
                  })()}
                </CardContent>
              </Card>

              {/* Contextual Factors */}
              {(scoringTransparency?.documentEvidence?.contextualFactors ?? []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Contextual Factors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(scoringTransparency?.documentEvidence?.contextualFactors ?? []).map((factor: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Assumptions Made */}
              {(scoringTransparency?.documentEvidence?.assumptionsMade ?? []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <span>Assumptions Made</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(scoringTransparency?.documentEvidence?.assumptionsMade ?? []).map((assumption: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <span className="text-yellow-600 mr-2">⚠</span>
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Document evidence details not available for this risk assessment.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Findings */}
          {riskAssessment.keyFindings && riskAssessment.keyFindings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>Key Findings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskAssessment.keyFindings.map((finding, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mitigation Tab */}
        <TabsContent value="mitigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Recommended Mitigation Strategies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskAssessment.mitigationStrategies && riskAssessment.mitigationStrategies.length > 0 ? (
                <div className="space-y-4">
                  {riskAssessment.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start">
                        <Badge variant="outline" className="mr-3 mt-1 bg-white border-green-200 text-green-800">
                          #{index + 1}
                        </Badge>
                        <p className="text-green-900">{strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific mitigation strategies available for this risk.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regulatory References */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Regulatory References</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessment.regulatoryReferences && riskAssessment.regulatoryReferences.length > 0 ? (
                  <div className="space-y-2">
                    {riskAssessment.regulatoryReferences.map((regulation, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2 border-red-200 text-red-700">
                        {regulation}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specific regulatory references identified.</p>
                )}
              </CardContent>
            </Card>

            {/* Industry Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span>Industry Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessment.industryBestPractices && riskAssessment.industryBestPractices.length > 0 ? (
                  <div className="space-y-2">
                    {riskAssessment.industryBestPractices.map((practice, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2 border-green-200 text-green-700">
                        {practice}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specific industry best practices identified.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Related Risks Tab */}
        <TabsContent value="related" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Related Risks in {riskAssessment.categoryName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedRisks && relatedRisks.length > 0 ? (
                <div className="space-y-3">
                  {relatedRisks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-900">{risk.subcategoryName}</h4>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getRiskLevelColor(risk.riskLevel)}>
                          {risk.riskLevel}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-700">
                          {risk.riskScore}/25
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/analysis/${reportId}/risk/${risk.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No other risks found in this category.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
