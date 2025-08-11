
/**
 * Comprehensive Risk Taxonomy System for Consistent Risk Analysis
 * Ensures all major risk categories are systematically validated
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Core risk taxonomy extracted from the comprehensive database
export interface RiskCategory {
  id: string;
  name: string;
  description: string;
  subcategories: RiskSubcategory[];
  mandatory: boolean; // Must be evaluated in every analysis
  weight: number; // Priority weight for consistency scoring
}

export interface RiskSubcategory {
  id: string;
  name: string;
  description: string;
  riskFactors: string[];
  likelihoodIndicators: string[];
  impactIndicators: string[];
}

export interface ConsistencyValidation {
  completenessScore: number; // 0-100, how many mandatory categories covered
  systematicScore: number; // 0-100, how systematic the analysis was
  comprehensivenessScore: number; // 0-100, depth of analysis
  overallScore: number; // Combined consistency score
  missingCategories: string[];
  recommendations: string[];
}

// Load comprehensive risk database
let riskDatabase: any = null;

function loadRiskDatabase() {
  if (!riskDatabase) {
    try {
      const dbPath = join(process.cwd(), 'data', 'ai_risk_assessment_database.json');
      const data = readFileSync(dbPath, 'utf8');
      riskDatabase = JSON.parse(data);
    } catch (error) {
      console.error('Failed to load risk database:', error);
      throw new Error('Risk database not available for systematic analysis');
    }
  }
  return riskDatabase;
}

// Comprehensive risk taxonomy based on database
export const MANDATORY_RISK_CATEGORIES: RiskCategory[] = [
  {
    id: 'data_privacy_protection',
    name: 'Data Privacy and Protection',
    description: 'GDPR, data processing, consent management, cross-border transfers',
    mandatory: true,
    weight: 10,
    subcategories: [
      {
        id: 'personal_data_processing',
        name: 'Personal Data Processing',
        description: 'Processing of personal data in AI systems',
        riskFactors: ['Excessive data collection', 'Lack of legal basis', 'Missing consent mechanisms'],
        likelihoodIndicators: ['Clear personal data processing requirements', 'Consumer-facing AI systems', 'Profiling and automated decisions'],
        impactIndicators: ['GDPR fines up to 4% revenue', 'Regulatory enforcement', 'Reputation damage']
      },
      {
        id: 'data_protection_by_design',
        name: 'Data Protection by Design and Default',
        description: 'Privacy-by-design implementation requirements',
        riskFactors: ['Missing privacy-by-design', 'No data minimization', 'Inadequate pseudonymization'],
        likelihoodIndicators: ['New AI system development', 'Legacy system integration', 'Third-party data processing'],
        impactIndicators: ['GDPR Article 25 violations', 'DPA investigations', 'Compliance costs']
      },
      {
        id: 'cross_border_transfers',
        name: 'Cross-Border Data Transfers',
        description: 'International data transfer compliance for AI systems',
        riskFactors: ['Inadequate transfer mechanisms', 'Missing SCCs', 'Third-country processing'],
        likelihoodIndicators: ['Global AI deployment', 'Cloud infrastructure', 'International vendors'],
        impactIndicators: ['Transfer suspension orders', 'GDPR Chapter V violations', 'Operational disruption']
      }
    ]
  },
  {
    id: 'cybersecurity_infrastructure',
    name: 'Cybersecurity and Infrastructure Security',
    description: 'NIS2, DORA, system vulnerabilities, incident response',
    mandatory: true,
    weight: 9,
    subcategories: [
      {
        id: 'ai_system_security',
        name: 'AI System Security Vulnerabilities',
        description: 'Security risks specific to AI systems and models',
        riskFactors: ['Model poisoning attacks', 'Adversarial inputs', 'Model extraction', 'Prompt injection'],
        likelihoodIndicators: ['Public-facing AI systems', 'Third-party model usage', 'Complex AI architectures'],
        impactIndicators: ['System compromise', 'Data breaches', 'Service disruption', 'Model theft']
      },
      {
        id: 'incident_response',
        name: 'Incident Response and Breach Notification',
        description: 'NIS2/DORA incident reporting and cybersecurity resilience',
        riskFactors: ['Inadequate monitoring', 'Missing incident procedures', 'Delayed notification'],
        likelihoodIndicators: ['Critical infrastructure sector', '50+ employees or €10M+ revenue', 'AI system complexity'],
        impactIndicators: ['NIS2 fines up to 2% revenue', 'Regulatory sanctions', 'Business continuity risks']
      },
      {
        id: 'third_party_security',
        name: 'Third-Party and Supply Chain Security',
        description: 'AI vendor security and supply chain risk management',
        riskFactors: ['Insecure AI vendors', 'Supply chain attacks', 'Inadequate vendor assessment'],
        likelihoodIndicators: ['Multiple AI service providers', 'Cloud-based AI services', 'Complex vendor ecosystems'],
        impactIndicators: ['Cascading security failures', 'Vendor lock-in risks', 'Compliance violations']
      }
    ]
  },
  {
    id: 'governance_accountability',
    name: 'AI Governance and Accountability',
    description: 'AI Act, algorithmic accountability, governance frameworks',
    mandatory: true,
    weight: 9,
    subcategories: [
      {
        id: 'ai_act_compliance',
        name: 'EU AI Act Compliance',
        description: 'High-risk AI system classification and requirements',
        riskFactors: ['High-risk AI classification', 'Missing risk management', 'Inadequate human oversight'],
        likelihoodIndicators: ['AI systems in Annex III sectors', 'Automated decision-making', 'Biometric processing'],
        impactIndicators: ['Fines up to 6% revenue', 'Market withdrawal', 'CE marking suspension']
      },
      {
        id: 'algorithmic_accountability',
        name: 'Algorithmic Transparency and Accountability',
        description: 'Explainability, fairness, and bias mitigation requirements',
        riskFactors: ['Black-box AI models', 'Algorithmic bias', 'Missing explainability', 'Unfair outcomes'],
        likelihoodIndicators: ['Complex ML models', 'Automated decisions affecting individuals', 'Sensitive attribute processing'],
        impactIndicators: ['Discrimination lawsuits', 'Regulatory investigations', 'Reputation damage', 'Market exclusion']
      },
      {
        id: 'governance_framework',
        name: 'AI Governance Framework',
        description: 'Board oversight, risk management, and organizational accountability',
        riskFactors: ['Missing AI governance', 'Inadequate board oversight', 'No AI risk management'],
        likelihoodIndicators: ['Significant AI deployment', 'Regulated industry', 'Public sector AI usage'],
        impactIndicators: ['Governance failures', 'Regulatory scrutiny', 'Strategic risks', 'Stakeholder trust loss']
      }
    ]
  },
  {
    id: 'regulatory_compliance',
    name: 'Regulatory and Legal Compliance',
    description: 'Sector-specific regulations, legal requirements, enforcement risks',
    mandatory: true,
    weight: 8,
    subcategories: [
      {
        id: 'sector_regulations',
        name: 'Sector-Specific AI Regulations',
        description: 'Industry-specific AI compliance requirements',
        riskFactors: ['Missing sector compliance', 'Regulatory gaps', 'Evolving requirements'],
        likelihoodIndicators: ['Regulated sectors (finance, healthcare, energy)', 'AI in critical applications'],
        impactIndicators: ['Sector-specific fines', 'License revocation', 'Operational restrictions']
      },
      {
        id: 'legal_liability',
        name: 'Legal Liability and Litigation Risk',
        description: 'Product liability, negligence, and AI-related legal risks',
        riskFactors: ['AI-caused harm', 'Product defects', 'Professional negligence', 'Contractual breaches'],
        likelihoodIndicators: ['AI affecting safety', 'Professional services AI', 'Consumer-facing AI products'],
        impactIndicators: ['Legal damages', 'Insurance claims', 'Class action lawsuits', 'Criminal liability']
      }
    ]
  },
  {
    id: 'operational_risks',
    name: 'Operational and Technical Risks',
    description: 'System reliability, performance, integration, and operational continuity',
    mandatory: true,
    weight: 7,
    subcategories: [
      {
        id: 'system_reliability',
        name: 'AI System Reliability and Performance',
        description: 'Model accuracy, drift, availability, and technical performance',
        riskFactors: ['Model performance degradation', 'System downtime', 'Scalability issues', 'Integration failures'],
        likelihoodIndicators: ['Complex AI systems', 'Real-time processing requirements', 'High transaction volumes'],
        impactIndicators: ['Service disruption', 'Customer dissatisfaction', 'Revenue loss', 'SLA breaches']
      },
      {
        id: 'business_continuity',
        name: 'Business Continuity and Disaster Recovery',
        description: 'AI system resilience and recovery capabilities',
        riskFactors: ['Single points of failure', 'Inadequate backup systems', 'Missing recovery procedures'],
        likelihoodIndicators: ['Mission-critical AI systems', 'Cloud dependencies', 'Complex architectures'],
        impactIndicators: ['Business interruption', 'Data loss', 'Recovery costs', 'Competitive disadvantage']
      }
    ]
  },
  {
    id: 'financial_commercial',
    name: 'Financial and Commercial Risks',
    description: 'Cost overruns, vendor dependencies, commercial viability',
    mandatory: false, // Important but not always applicable
    weight: 6,
    subcategories: [
      {
        id: 'cost_overruns',
        name: 'AI Implementation Cost Overruns',
        description: 'Budget risks and unexpected AI implementation costs',
        riskFactors: ['Underestimated complexity', 'Scope creep', 'Integration challenges', 'Skills shortage'],
        likelihoodIndicators: ['Large-scale AI deployment', 'Custom AI development', 'Legacy system integration'],
        impactIndicators: ['Budget overruns', 'Project delays', 'ROI reduction', 'Resource constraints']
      },
      {
        id: 'vendor_dependency',
        name: 'AI Vendor Lock-in and Dependency',
        description: 'Commercial risks from AI vendor relationships',
        riskFactors: ['Single vendor dependency', 'Proprietary technologies', 'Limited alternatives'],
        likelihoodIndicators: ['Specialized AI services', 'Integrated AI platforms', 'Custom AI solutions'],
        impactIndicators: ['Switching costs', 'Negotiation weakness', 'Service discontinuation risks']
      }
    ]
  }
];

// Generate systematic risk analysis prompt - OPTIMIZED FOR RELIABILITY
export function generateSystematicRiskPrompt(documentContent: string, perspective: string): string {
  return `You are an AI risk assessment expert conducting a comprehensive analysis of this ${perspective} RFP document.

COMPREHENSIVE ANALYSIS REQUIRED - Generate at least 8-10 risk assessments covering these categories:

1. Data Privacy & Protection
   - GDPR compliance, consent mechanisms, personal data processing
2. Cybersecurity & Infrastructure Security  
   - System vulnerabilities, network security, access controls
3. AI Governance & Accountability
   - Algorithmic transparency, decision accountability, explainability
4. Regulatory & Legal Compliance
   - AI Act compliance, sector regulations, legal liability
5. Operational & Technical Risks
   - System reliability, integration challenges, performance issues
6. Financial & Commercial Risks
   - Cost overruns, vendor lock-in, budget constraints
7. Ethical & Social Risks
   - Bias detection, fairness concerns, social impact
8. Implementation & Change Management
   - Staff training, change resistance, organizational readiness

ANALYSIS REQUIREMENTS:
- Generate 8-12 comprehensive risk assessments across the above categories
- Ensure at least 1 risk per category where applicable to the document
- Score each risk: Likelihood (1-5) × Impact (1-5) = Risk Score
- Include specific evidence from the document
- Provide detailed mitigation strategies
- Include regulatory references with links where possible
- Include industry best practices with links where possible

OUTPUT FORMAT: Return ONLY valid JSON with this structure:

{
  "overall_assessment": {
    "risk_score": [number 1-25],
    "risk_level": "[low|medium|high|extreme]",
    "summary": "Comprehensive executive summary",
    "recommendations": "Key strategic recommendations"
  },
  "risk_assessments": [
    {
      "category": "One of the 8 categories above",
      "subcategory": "Specific subcategory",
      "risk_description": "Detailed risk description with evidence",
      "likelihood_score": [1-5],
      "impact_score": [1-5], 
      "risk_score": [likelihood × impact],
      "risk_level": "[low|medium|high|extreme]",
      "key_findings": ["Finding 1", "Finding 2"],
      "mitigation_strategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
      "regulatory_references": [{"name": "Regulation name", "link": "https://..."}],
      "industry_best_practices": [{"name": "Best practice", "link": "https://..."}],
      "evidence_from_document": ["Relevant quote from document"]
    }
  ]
}

Document Content:
${documentContent}`;
}

// Validate risk coverage and consistency
export function validateRiskCoverage(analysis: any): ConsistencyValidation {
  const mandatoryCategories = MANDATORY_RISK_CATEGORIES.filter(cat => cat.mandatory);
  const assessments = analysis.risk_assessments || [];
  
  // Check which mandatory categories are covered
  const coveredCategories = new Set();
  const missingCategories: string[] = [];
  
  for (const assessment of assessments) {
    const category = assessment.category;
    for (const mandatoryCat of mandatoryCategories) {
      if (category.toLowerCase().includes(mandatoryCat.name.toLowerCase()) ||
          mandatoryCat.name.toLowerCase().includes(category.toLowerCase())) {
        coveredCategories.add(mandatoryCat.id);
      }
    }
  }
  
  for (const mandatoryCat of mandatoryCategories) {
    if (!coveredCategories.has(mandatoryCat.id)) {
      missingCategories.push(mandatoryCat.name);
    }
  }
  
  // Calculate scores
  const completenessScore = Math.round((coveredCategories.size / mandatoryCategories.length) * 100);
  
  // Check systematic analysis quality
  let systematicScore = 0;
  let totalTransparencyScore = 0;
  let validAssessments = 0;
  
  for (const assessment of assessments) {
    let assessmentScore = 0;
    
    // Check required fields
    if (assessment.scoring_transparency?.likelihood_factors?.evidence_factors?.length > 0) assessmentScore += 25;
    if (assessment.scoring_transparency?.impact_factors?.evidence_factors?.length > 0) assessmentScore += 25;
    if (assessment.evidence_from_document?.length > 0) assessmentScore += 25;
    if (assessment.key_findings?.length >= 2) assessmentScore += 25;
    
    totalTransparencyScore += assessmentScore;
    validAssessments++;
  }
  
  systematicScore = validAssessments > 0 ? Math.round(totalTransparencyScore / validAssessments) : 0;
  
  // Check comprehensiveness
  const avgRisksPerCategory = assessments.length / Math.max(coveredCategories.size, 1);
  const comprehensivenessScore = Math.min(100, Math.round(
    (assessments.length * 10) + // Base points for number of risks
    (avgRisksPerCategory * 20) + // Points for depth per category
    (systematicScore * 0.3) // Bonus for systematic analysis
  ));
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (completenessScore * 0.4) + 
    (systematicScore * 0.3) + 
    (comprehensivenessScore * 0.3)
  );
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (completenessScore < 80) {
    recommendations.push(`Improve category coverage: ${missingCategories.length} mandatory categories missing`);
  }
  if (systematicScore < 70) {
    recommendations.push('Enhance systematic analysis with more detailed evidence and transparency data');
  }
  if (comprehensivenessScore < 70) {
    recommendations.push('Increase analysis depth with more risks per category');
  }
  if (assessments.length < 5) {
    recommendations.push('Minimum 5 risks required for comprehensive analysis');
  }
  if (overallScore >= 85) {
    recommendations.push('Excellent systematic coverage - analysis meets high consistency standards');
  }
  
  return {
    completenessScore,
    systematicScore,
    comprehensivenessScore,
    overallScore,
    missingCategories,
    recommendations
  };
}

// Get enhanced compliance context with systematic coverage
export function getSystematicComplianceContext(): string {
  const db = loadRiskDatabase();
  
  let context = "**SYSTEMATIC COMPLIANCE VALIDATION FRAMEWORK**\n\n";
  context += "**MANDATORY REGULATORY COVERAGE:**\n";
  context += "• GDPR: Data protection, privacy by design, DPIAs, breach notification\n";
  context += "• NIS2: Cybersecurity risk management, incident reporting, supply chain security\n"; 
  context += "• DORA: ICT risk management, digital resilience testing, third-party oversight\n";
  context += "• EU AI Act: High-risk AI systems, conformity assessment, CE marking\n";
  context += "• CIPM: Privacy impact assessment, AI privacy controls, governance frameworks\n\n";
  
  context += "**SYSTEMATIC RISK CATEGORIES:**\n";
  for (const category of MANDATORY_RISK_CATEGORIES) {
    context += `• ${category.name}: ${category.description}\n`;
  }
  
  return context;
}

// Enhanced risk database context for comprehensive analysis
export function getComprehensiveRiskContext(): string {
  const db = loadRiskDatabase();
  
  // Extract all risk categories from database  
  const categories = Object.values(db.risk_categories || {})
    .map((cat: any) => cat.name)
    .filter(Boolean);
  
  const systematicCategories = MANDATORY_RISK_CATEGORIES.map(cat => cat.name);
  
  return `**COMPREHENSIVE RISK TAXONOMY:**
Mandatory Categories: ${systematicCategories.join(', ')}
Database Categories: ${categories.join(', ')}

**SYSTEMATIC ANALYSIS REQUIRED FOR:**
${MANDATORY_RISK_CATEGORIES.map(cat => 
  `• ${cat.name}: ${cat.subcategories.map(sub => sub.name).join(', ')}`
).join('\n')}`;
}
