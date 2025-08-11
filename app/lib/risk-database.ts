import { readFileSync } from 'fs';
import { join } from 'path';

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
      // Fallback to simplified categories
      riskDatabase = {
        risk_categories: {
          'simplified_categories': ['Data Privacy and Protection', 'Security Vulnerabilities', 'Regulatory Compliance']
        }
      };
    }
  }
  return riskDatabase;
}

export function getComprehensiveRiskContext(): string {
  const db = loadRiskDatabase();
  
  // Extract risk categories
  const categories = Object.values(db.risk_categories || {}).map((cat: any) => cat.name).filter(Boolean);
  
  return categories.join(', ');
}

export function getRegulatoryComplianceContext(): string {
  const db = loadRiskDatabase();
  
  if (!db.regulatory_compliance_mapping) {
    return "GDPR, NIS2, DORA, EU AI Act compliance requirements";
  }
  
  let context = "**REGULATORY COMPLIANCE REQUIREMENTS:**\n\n";
  
  // GDPR
  if (db.regulatory_compliance_mapping.GDPR) {
    const gdpr = db.regulatory_compliance_mapping.GDPR;
    context += `**GDPR (${gdpr.official_link}):**\n`;
    context += `Scope: ${gdpr.scope}\n`;
    context += `Penalties: ${gdpr.penalties}\n`;
    
    Object.entries(gdpr.key_articles || {}).forEach(([articleKey, article]: [string, any]) => {
      context += `\n• ${article.title} (${article.link}):\n`;
      context += `  Requirements: ${article.requirements?.slice(0, 3).join('; ')}\n`;
      context += `  Evidence Required: ${article.evidence_required?.slice(0, 3).join('; ')}\n`;
    });
    context += "\n";
  }
  
  // NIS2
  if (db.regulatory_compliance_mapping.NIS2) {
    const nis2 = db.regulatory_compliance_mapping.NIS2;
    context += `**NIS2 (${nis2.official_link}):**\n`;
    context += `Scope: ${nis2.scope}\n`;
    context += `Penalties: ${nis2.penalties}\n`;
    
    Object.entries(nis2.key_articles || {}).forEach(([articleKey, article]: [string, any]) => {
      context += `\n• ${article.title} (${article.link}):\n`;
      context += `  Requirements: ${article.requirements?.slice(0, 3).join('; ')}\n`;
      context += `  Evidence Required: ${article.evidence_required?.slice(0, 3).join('; ')}\n`;
    });
    context += "\n";
  }
  
  // DORA
  if (db.regulatory_compliance_mapping.DORA) {
    const dora = db.regulatory_compliance_mapping.DORA;
    context += `**DORA (${dora.official_link}):**\n`;
    context += `Scope: ${dora.scope}\n`;
    context += `Penalties: ${dora.penalties}\n`;
    
    Object.entries(dora.key_articles || {}).forEach(([articleKey, article]: [string, any]) => {
      context += `\n• ${article.title} (${article.link}):\n`;
      context += `  Requirements: ${article.requirements?.slice(0, 3).join('; ')}\n`;
      context += `  Evidence Required: ${article.evidence_required?.slice(0, 3).join('; ')}\n`;
    });
    context += "\n";
  }
  
  // EU AI Act
  if (db.regulatory_compliance_mapping.EU_AI_Act) {
    const aiAct = db.regulatory_compliance_mapping.EU_AI_Act;
    context += `**EU AI Act (${aiAct.official_link}):**\n`;
    context += `Scope: ${aiAct.scope}\n`;
    context += `Penalties: ${aiAct.penalties}\n`;
    
    Object.entries(aiAct.key_articles || {}).forEach(([articleKey, article]: [string, any]) => {
      context += `\n• ${article.title} (${article.link}):\n`;
      context += `  Requirements: ${article.requirements?.slice(0, 3).join('; ')}\n`;
      context += `  Evidence Required: ${article.evidence_required?.slice(0, 3).join('; ')}\n`;
    });
    context += "\n";
  }
  
  return context;
}

export function getNISTFrameworkContext(): string {
  const db = loadRiskDatabase();
  
  if (!db.regulatory_compliance_mapping?.NIST_AI_RMF) {
    return "NIST AI Risk Management Framework - Govern, Map, Measure, Manage functions";
  }
  
  const nist = db.regulatory_compliance_mapping.NIST_AI_RMF;
  let context = `**NIST AI RMF (${nist.official_link}):**\n\n`;
  
  Object.entries(nist.framework_functions || {}).forEach(([funcKey, func]: [string, any]) => {
    context += `• ${func.title} (${func.link}):\n`;
    context += `  Practices: ${func.practices?.slice(0, 3).join('; ')}\n`;
    context += `  Evidence Required: ${func.evidence_required?.slice(0, 2).join('; ')}\n\n`;
  });
  
  return context;
}

export function getOWASPSecurityContext(): string {
  const db = loadRiskDatabase();
  
  if (!db.regulatory_compliance_mapping?.OWASP_AI_Security) {
    return "OWASP AI Security - Governance, IT Security, AI-Specific Security, Data Science Security, Privacy";
  }
  
  const owasp = db.regulatory_compliance_mapping.OWASP_AI_Security;
  let context = `**OWASP AI Security (${owasp.official_link}):**\n\n`;
  
  Object.entries(owasp.security_pillars || {}).forEach(([pillarKey, pillar]: [string, any]) => {
    context += `• ${pillar.title}:\n`;
    context += `  Practices: ${pillar.practices?.slice(0, 2).join('; ')}\n`;
    context += `  Evidence Required: ${pillar.evidence_required?.slice(0, 2).join('; ')}\n\n`;
  });
  
  return context;
}

export function getISOStandardsContext(): string {
  const db = loadRiskDatabase();
  
  if (!db.regulatory_compliance_mapping?.ISO_Standards) {
    return "ISO 27001:2022 Information Security Management, ISO 23053:2022 AI Framework";
  }
  
  const iso = db.regulatory_compliance_mapping.ISO_Standards;
  let context = `**ISO Standards:**\n\n`;
  
  Object.entries(iso.key_standards || {}).forEach(([stdKey, standard]: [string, any]) => {
    context += `• ${standard.title} (${standard.official_link}):\n`;
    if (standard.ai_relevant_controls) {
      context += `  Controls: ${standard.ai_relevant_controls?.slice(0, 3).join('; ')}\n`;
    }
    if (standard.framework_components) {
      context += `  Components: ${standard.framework_components?.slice(0, 3).join('; ')}\n`;
    }
    context += `  Evidence Required: ${standard.evidence_required?.slice(0, 2).join('; ')}\n\n`;
  });
  
  return context;
}

export function getCIMPFrameworkContext(): string {
  const db = loadRiskDatabase();
  
  if (!db.regulatory_compliance_mapping?.CIPM) {
    return "CIPM (Certified Information Privacy Manager) - Privacy by Design, Automated Decision-Making Compliance, AI Privacy Risk Management";
  }
  
  const cipm = db.regulatory_compliance_mapping.CIPM;
  let context = `**CIPM - Certified Information Privacy Manager (${cipm.official_link}):**\n`;
  context += `Scope: ${cipm.scope}\n`;
  context += `Framework: ${cipm.framework_overview}\n\n`;
  
  // Key CIMP domains
  context += `**AI-Specific Privacy Focus Areas:**\n`;
  cipm.ai_specific_focus?.forEach((focus: string) => {
    context += `• ${focus}\n`;
  });
  context += "\n";
  
  // Key domains
  Object.entries(cipm.key_domains || {}).forEach(([domainKey, domain]: [string, any]) => {
    context += `• ${domain.title}:\n`;
    context += `  Focus: ${domain.focus}\n`;
    context += `  Requirements: ${domain.requirements?.slice(0, 3).join('; ')}\n`;
    context += `  Evidence Required: ${domain.evidence_required?.slice(0, 2).join('; ')}\n`;
    context += `  Best Practices: ${domain.industry_best_practices?.slice(0, 2).join('; ')}\n\n`;
  });
  
  // Integration with other regulations
  if (cipm.integration_with_regulations) {
    context += `**Regulatory Integration:**\n`;
    Object.entries(cipm.integration_with_regulations).forEach(([reg, description]: [string, any]) => {
      context += `• ${reg}: ${description}\n`;
    });
    context += "\n";
  }
  
  return context;
}

export function getEnhancedComplianceContext(): string {
  let context = "";
  
  context += getRegulatoryComplianceContext();
  context += "\n" + getNISTFrameworkContext();
  context += "\n" + getOWASPSecurityContext();
  context += "\n" + getISOStandardsContext();
  context += "\n" + getCIMPFrameworkContext();
  
  return context;
}

// Legacy function for backward compatibility
export function getSimpleRiskContext(): string {
  return getComprehensiveRiskContext();
}
