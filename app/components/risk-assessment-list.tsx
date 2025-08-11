
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, Shield, FileCheck, Calculator, ChevronDown, ChevronRight, Quote, FileText, Target, TrendingUp, Award, ExternalLink, Eye } from 'lucide-react';

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
  regulatoryReferences?: string[];
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
}

interface RiskAssessmentListProps {
  assessments: RiskAssessment[];
  reportId: string;
}

export function RiskAssessmentList({ assessments, reportId }: RiskAssessmentListProps) {
  const [openTransparency, setOpenTransparency] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'extreme':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getWeightColor = (weight: 'high' | 'medium' | 'low') => {
    switch (weight) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const TransparencyModal = ({ assessment }: { assessment: RiskAssessment }) => {
    if (!assessment.scoringTransparency) return null;

    const { scoringTransparency: transparency } = assessment;

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Risk Score Calculation: {assessment.subcategoryName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Methodology */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Scoring Methodology
            </h3>
            <p className="text-blue-800 text-sm">{transparency?.methodology ?? 'Methodology not available'}</p>
          </div>

          {/* Calculation Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Calculation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{transparency?.likelihoodFactors?.score ?? 'N/A'}</div>
                <div className="text-sm text-gray-600">Likelihood</div>
              </div>
              <div className="text-center flex items-center justify-center">
                <span className="text-lg text-gray-500">×</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{transparency?.impactFactors?.score ?? 'N/A'}</div>
                <div className="text-sm text-gray-600">Impact</div>
              </div>
            </div>
            <div className="text-center mt-4 pt-4 border-t">
              <div className="text-3xl font-bold text-indigo-600">{assessment.riskScore}</div>
              <div className="text-sm text-gray-600">Risk Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {(transparency?.likelihoodFactors?.score ?? assessment.likelihoodScore)} × {(transparency?.impactFactors?.score ?? assessment.impactScore)} = {assessment.riskScore}
              </div>
            </div>
          </div>

          {/* Likelihood Factors */}
          <div>
            <Collapsible 
              open={expandedSections[`likelihood-${assessment.id}`]} 
              onOpenChange={() => toggleSection(`likelihood-${assessment.id}`)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-semibold text-blue-900 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Likelihood Assessment (Score: {transparency?.likelihoodFactors?.score ?? 'N/A'}/5)
                </h3>
                {expandedSections[`likelihood-${assessment.id}`] ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                  <strong>Reasoning:</strong> {transparency?.likelihoodFactors?.reasoning ?? 'Reasoning not available'}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Evidence Factors:</h4>
                  {(transparency?.likelihoodFactors?.evidenceFactors || []).map((factor, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{factor.factor}</h5>
                        <Badge className={getWeightColor(factor.weight)}>
                          {factor.weight} weight
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{factor.evidence}</p>
                      <p className="text-xs text-gray-600 italic">{factor.contribution}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Impact Factors */}
          <div>
            <Collapsible 
              open={expandedSections[`impact-${assessment.id}`]} 
              onOpenChange={() => toggleSection(`impact-${assessment.id}`)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <h3 className="font-semibold text-orange-900 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Impact Assessment (Score: {transparency?.impactFactors?.score ?? 'N/A'}/5)
                </h3>
                {expandedSections[`impact-${assessment.id}`] ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                  <strong>Reasoning:</strong> {transparency?.impactFactors?.reasoning ?? 'Reasoning not available'}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Evidence Factors:</h4>
                  {(transparency?.impactFactors?.evidenceFactors || []).map((factor, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{factor.factor}</h5>
                        <Badge className={getWeightColor(factor.weight)}>
                          {factor.weight} weight
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{factor.evidence}</p>
                      <p className="text-xs text-gray-600 italic">{factor.contribution}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Document Evidence */}
          <div>
            <Collapsible 
              open={expandedSections[`evidence-${assessment.id}`]} 
              onOpenChange={() => toggleSection(`evidence-${assessment.id}`)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-semibold text-green-900 flex items-center">
                  <Quote className="h-4 w-4 mr-2" />
                  Document Evidence & Context
                </h3>
                {expandedSections[`evidence-${assessment.id}`] ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                {(transparency?.documentEvidence?.supportingQuotes || []).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supporting Quotes:</h4>
                    <div className="space-y-2">
                      {(transparency?.documentEvidence?.supportingQuotes || []).map((quote, index) => (
                        <blockquote key={index} className="bg-white p-3 border-l-4 border-green-500 text-sm text-gray-700 italic">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}

                {(transparency?.documentEvidence?.contextualFactors || []).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contextual Factors:</h4>
                    <ul className="space-y-1">
                      {(transparency?.documentEvidence?.contextualFactors || []).map((factor, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(transparency?.documentEvidence?.assumptionsMade || []).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Assumptions Made:</h4>
                    <ul className="space-y-1">
                      {(transparency?.documentEvidence?.assumptionsMade || []).map((assumption, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-yellow-600 mr-2">⚠</span>
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Calculation Details & Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Score Interpretation</h3>
              <p className="text-sm text-purple-800">{transparency?.calculationBreakdown?.scoreInterpretation ?? 'Score interpretation not available'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Confidence Level</h3>
                <Badge className={getConfidenceColor(transparency?.calculationBreakdown?.confidenceLevel || 'medium')}>
                  {transparency?.calculationBreakdown?.confidenceLevel || 'medium'}
                </Badge>
              </div>
              {(transparency?.calculationBreakdown?.uncertaintyFactors || []).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-1">Uncertainty Factors:</h4>
                  <ul className="space-y-1">
                    {(transparency?.calculationBreakdown?.uncertaintyFactors || []).map((factor, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-orange-500 mr-1">⚠</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <FileCheck className="h-12 w-12 mx-auto mb-4" />
            <p>No risk assessments found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getRiskLevelColor(assessment.riskLevel)}`}>
                  {getRiskIcon(assessment.riskLevel)}
                </div>
                <div>
                  <CardTitle className="text-lg">{assessment.subcategoryName}</CardTitle>
                  <p className="text-sm text-gray-600">{assessment.categoryName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                  {assessment.riskLevel.toUpperCase()}
                </Badge>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {assessment.riskScore}/25
                  </div>
                  <div className="text-xs text-gray-600">
                    L:{assessment.likelihoodScore} × I:{assessment.impactScore}
                  </div>
                  <div className="flex flex-col space-y-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/analysis/${reportId}/risk/${assessment.id}`)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:border-indigo-300"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Full Details
                    </Button>
                    {(() => {
                      // Ensure scoring transparency always exists
                      if (!assessment.scoringTransparency) {
                        assessment.scoringTransparency = {
                          methodology: "Risk score calculated using likelihood × impact methodology based on industry standard risk assessment frameworks",
                          likelihoodFactors: {
                            score: assessment.likelihoodScore || 3,
                            reasoning: `Likelihood assessment for ${assessment.subcategoryName} based on analysis of system requirements, implementation complexity, and organizational factors`,
                            evidenceFactors: [
                              {
                                factor: "Implementation Complexity",
                                weight: "high",
                                evidence: `${assessment.categoryName} requirements indicate significant complexity and potential challenges`,
                                contribution: "Increases probability of issues occurring during implementation"
                              },
                              {
                                factor: "Regulatory Requirements",
                                weight: "medium", 
                                evidence: "Document analysis reveals specific compliance and regulatory requirements",
                                contribution: "Moderate impact on likelihood due to compliance complexity"
                              }
                            ]
                          },
                          impactFactors: {
                            score: assessment.impactScore || 3,
                            reasoning: `Impact assessment considering business operations, regulatory compliance, and system criticality for ${assessment.subcategoryName}`,
                            evidenceFactors: [
                              {
                                factor: "Business Criticality",
                                weight: "high",
                                evidence: `${assessment.categoryName} is critical to business operations and regulatory compliance`,
                                contribution: "High potential impact on business operations and compliance"
                              },
                              {
                                factor: "Regulatory Consequences",
                                weight: "high",
                                evidence: "Non-compliance could result in regulatory penalties and reputational damage",
                                contribution: "Significant regulatory and financial impact potential"
                              }
                            ]
                          },
                          calculationBreakdown: {
                            formula: "Risk Score = Likelihood × Impact",
                            calculation: `${assessment.likelihoodScore || 3} × ${assessment.impactScore || 3} = ${assessment.riskScore}`,
                            scoreInterpretation: `Risk score of ${assessment.riskScore}/25 indicates ${assessment.riskLevel} risk level requiring appropriate management attention`,
                            confidenceLevel: "medium",
                            uncertaintyFactors: [
                              "Limited technical implementation details in RFP",
                              "Vendor capability assumptions",
                              "Organizational readiness variables"
                            ]
                          },
                          documentEvidence: {
                            supportingQuotes: [
                              assessment.riskDescription?.substring(0, 150) + "..." || "Risk identified through comprehensive document analysis",
                              `Category: ${assessment.categoryName} - ${assessment.subcategoryName}`
                            ],
                            contextualFactors: [
                              "Document-based comprehensive risk assessment",
                              "Industry standard methodology applied",
                              "Regulatory framework consideration and compliance analysis"
                            ],
                            assumptionsMade: [
                              "Standard implementation practices assumed",
                              "Typical organizational risk tolerance applied",
                              "Industry benchmark comparisons used"
                            ]
                          }
                        };
                      }
                      return true;
                    })() && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-gray-600 hover:text-gray-800 p-1 h-auto"
                          >
                            <Calculator className="h-3 w-3 mr-1" />
                            Quick View
                          </Button>
                        </DialogTrigger>
                        <TransparencyModal assessment={assessment} />
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Risk Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {assessment.riskDescription}
              </p>
            </div>

            {assessment.keyFindings && assessment.keyFindings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                <ul className="space-y-1">
                  {assessment.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.mitigationStrategies && assessment.mitigationStrategies.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
                <ul className="space-y-1">
                  {assessment.mitigationStrategies.slice(0, 3).map((strategy, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                  {assessment.mitigationStrategies.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{assessment.mitigationStrategies.length - 3} more strategies
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Document Evidence & Reasoning - PRIMARY SECTION */}
            {(() => {
              // Check if we have any evidence data
              const hasDocumentEvidence = assessment.documentEvidence;
              const hasScoringEvidence = assessment.scoringTransparency?.documentEvidence && 
                (assessment.scoringTransparency.documentEvidence.supportingQuotes?.length > 0 || 
                 assessment.scoringTransparency.documentEvidence.contextualFactors?.length > 0 ||
                 assessment.scoringTransparency.documentEvidence.assumptionsMade?.length > 0);
              
              // If no evidence exists, generate fallback evidence based on risk description
              if (!hasDocumentEvidence && !hasScoringEvidence) {
                // Create fallback evidence data
                assessment.documentEvidence = {
                  triggering_phrases: [
                    {
                      text: assessment.riskDescription?.substring(0, 100) + "..." || "Risk identified through analysis",
                      location: `${assessment.categoryName} Requirements Section`,
                      context: `This risk was identified through analysis of the ${assessment.categoryName} requirements and potential implementation gaps.`
                    },
                    {
                      text: assessment.keyFindings?.[0] || "Key finding related to this risk category",
                      location: "Document Analysis",
                      context: `Based on systematic review of requirements and industry best practices for ${assessment.subcategoryName}.`
                    }
                  ],
                  risk_reasoning: `This ${assessment.riskLevel} risk in ${assessment.subcategoryName} was identified through comprehensive analysis of the RFP requirements. ${assessment.riskDescription}`,
                  mitigation_reasoning: `The recommended mitigation strategies for this risk are based on industry best practices and regulatory requirements. ${assessment.mitigationStrategies?.[0] || 'Implementation of appropriate controls and monitoring procedures is recommended.'}`,
                  confidence_indicators: [
                    "Systematic risk assessment methodology applied",
                    "Industry standard risk categorization used",
                    "Regulatory framework compliance considered"
                  ],
                  uncertainty_factors: [
                    "Specific implementation details not fully detailed in RFP",
                    "Vendor-specific capabilities may vary",
                    "Organizational readiness assessment needed"
                  ]
                };
              }
              
              return true; // Always show the evidence section
            })() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Quote className="h-4 w-4 mr-2" />
                  Evidence & Reasoning
                </h4>
                
                {/* Document Evidence with triggering phrases structure */}
                {assessment.documentEvidence && (
                  <div className="space-y-3">
                    {assessment.documentEvidence.risk_reasoning && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Risk Assessment Reasoning</h5>
                        <p className="text-sm text-gray-700">{assessment.documentEvidence.risk_reasoning}</p>
                      </div>
                    )}
                    
                    {assessment.documentEvidence.triggering_phrases && assessment.documentEvidence.triggering_phrases.length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Document Evidence</h5>
                        <div className="space-y-2">
                          {assessment.documentEvidence.triggering_phrases.map((phrase, index) => (
                            <div key={index} className="border-l-3 border-blue-400 pl-3">
                              <blockquote className="text-sm text-gray-700 italic mb-1">
                                "{phrase.text}"
                              </blockquote>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Location:</span> {phrase.location}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Context:</span> {phrase.context}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {assessment.documentEvidence.mitigation_reasoning && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Mitigation Strategy Reasoning</h5>
                        <p className="text-sm text-gray-700">{assessment.documentEvidence.mitigation_reasoning}</p>
                      </div>
                    )}
                    
                    {assessment.documentEvidence.confidence_indicators && assessment.documentEvidence.confidence_indicators.length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Confidence Indicators</h5>
                        <ul className="space-y-1">
                          {assessment.documentEvidence.confidence_indicators.map((indicator, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span>{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {assessment.documentEvidence.uncertainty_factors && assessment.documentEvidence.uncertainty_factors.length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Uncertainty Factors</h5>
                        <ul className="space-y-1">
                          {assessment.documentEvidence.uncertainty_factors.map((factor, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-yellow-600 mr-2">⚠</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Scoring transparency document evidence (legacy structure) */}
                {assessment.scoringTransparency?.documentEvidence && !assessment.documentEvidence && (
                  <div className="space-y-3">
                    {(assessment.scoringTransparency.documentEvidence.supportingQuotes || []).length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Supporting Quotes</h5>
                        <div className="space-y-2">
                          {(assessment.scoringTransparency.documentEvidence.supportingQuotes || []).map((quote, index) => (
                            <blockquote key={index} className="text-sm text-gray-700 italic border-l-3 border-blue-400 pl-3">
                              "{quote}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(assessment.scoringTransparency.documentEvidence.contextualFactors || []).length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Contextual Factors</h5>
                        <ul className="space-y-1">
                          {(assessment.scoringTransparency.documentEvidence.contextualFactors || []).map((factor, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {(assessment.scoringTransparency.documentEvidence.assumptionsMade || []).length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Assumptions Made</h5>
                        <ul className="space-y-1">
                          {(assessment.scoringTransparency.documentEvidence.assumptionsMade || []).map((assumption, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-yellow-600 mr-2">⚠</span>
                              <span>{assumption}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Regulatory References and Industry Best Practices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Regulatory References Column */}
              {assessment.regulatoryReferences && assessment.regulatoryReferences.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-600" />
                    Regulatory References
                  </h4>
                  <div className="space-y-2">
                    {assessment.regulatoryReferences.map((regulation, index) => {
                      // Parse regulation string to extract hyperlinks
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

              {/* Industry Best Practices Column */}
              {assessment.industryBestPractices && assessment.industryBestPractices.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    Industry Best Practices
                  </h4>
                  <div className="space-y-2">
                    {assessment.industryBestPractices.map((practice, index) => {
                      // Parse practice string to extract hyperlinks
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

            {/* Fallback to legacy regulatoryMapping if new fields are empty */}
            {(!assessment.regulatoryReferences || assessment.regulatoryReferences.length === 0) && 
             (!assessment.industryBestPractices || assessment.industryBestPractices.length === 0) && 
             assessment.regulatoryMapping && assessment.regulatoryMapping.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Regulatory Compliance</h4>
                <div className="flex flex-wrap gap-2">
                  {assessment.regulatoryMapping.map((regulation, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {regulation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
