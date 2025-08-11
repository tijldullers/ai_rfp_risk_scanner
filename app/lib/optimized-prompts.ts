
// Optimized prompts for faster LLM processing
export function generateOptimizedRiskPrompt(content: string, perspective: string, isChunked: boolean = false, chunkInfo?: { index: number; total: number }): string {
  const chunkPrefix = isChunked ? `[CHUNK ${chunkInfo!.index + 1}/${chunkInfo!.total}] ` : '';
  
  return `${chunkPrefix}Analyze this RFP document for compliance risks from a ${perspective} perspective.

DOCUMENT CONTENT:
${content}

REQUIRED OUTPUT (JSON only, no explanations):
{
  "overallRiskScore": <number 1-10>,
  "riskCategories": [
    {
      "category": "<category_name>",
      "riskLevel": "<low|medium|high>",
      "score": <number 1-10>,
      "findings": ["<finding1>", "<finding2>"],
      "recommendations": ["<rec1>", "<rec2>"]
    }
  ],
  "keyFindings": ["<finding1>", "<finding2>", "<finding3>"],
  "criticalIssues": ["<issue1>", "<issue2>"],
  "complianceGaps": ["<gap1>", "<gap2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}

Focus on: Data Privacy, Security, Compliance, Operational, Financial, Legal risks. Be concise but thorough.`;
}

export function generateFallbackPrompt(content: string, perspective: string): string {
  return `Quick risk assessment for ${perspective} perspective:

CONTENT: ${content.substring(0, 3000)}

JSON OUTPUT:
{
  "overallRiskScore": <1-10>,
  "keyFindings": ["<top 3 findings>"],
  "criticalIssues": ["<top 2 issues>"],
  "recommendations": ["<top 3 recommendations>"]
}`;
}

export function generateChunkSummaryPrompt(chunkResults: any[]): string {
  return `Consolidate these risk analysis chunks into a comprehensive report:

CHUNK RESULTS:
${JSON.stringify(chunkResults, null, 2)}

OUTPUT (JSON):
{
  "overallRiskScore": <consolidated score 1-10>,
  "riskCategories": [<merged categories>],
  "keyFindings": [<top findings across all chunks>],
  "criticalIssues": [<most critical issues>],
  "complianceGaps": [<key gaps identified>],
  "recommendations": [<prioritized recommendations>]
}`;
}
