"use strict";
/**
 * Robust JSON parser with fallback mechanisms for AI responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnalysisStructure = exports.cleanAndParseAiJson = void 0;
function cleanAndParseAiJson(rawContent) {
    console.log('🧹 [JSON-PARSER] Starting JSON parsing with fallbacks');
    console.log('📄 [JSON-PARSER] Raw content length:', rawContent.length);
    // Method 1: Try direct parsing first
    try {
        const parsed = JSON.parse(rawContent);
        console.log('✅ [JSON-PARSER] Direct parsing successful');
        return { success: true, data: parsed, method: 'direct' };
    }
    catch (directError) {
        console.log('❌ [JSON-PARSER] Direct parsing failed:', directError instanceof Error ? directError.message : 'Unknown error');
        // Log problematic content around error position for debugging
        if (directError instanceof SyntaxError && directError.message.includes('position')) {
            const positionMatch = directError.message.match(/position (\d+)/);
            if (positionMatch) {
                const position = parseInt(positionMatch[1]);
                const start = Math.max(0, position - 100);
                const end = Math.min(rawContent.length, position + 100);
                console.log('📄 [JSON-PARSER] Problematic content around error position:', rawContent.substring(start, end));
                console.log('📍 [JSON-PARSER] Error position marker:', ' '.repeat(Math.min(100, position - start)) + '^');
            }
        }
    }
    // Method 2: Extract JSON from code blocks (common AI response format)
    try {
        const codeBlockMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
            const extracted = codeBlockMatch[1];
            const parsed = JSON.parse(extracted);
            console.log('✅ [JSON-PARSER] Code block extraction successful');
            return { success: true, data: parsed, method: 'code_block' };
        }
    }
    catch (codeBlockError) {
        console.log('❌ [JSON-PARSER] Code block parsing failed:', codeBlockError instanceof Error ? codeBlockError.message : 'Unknown error');
    }
    // Method 3: Find first complete JSON object
    try {
        const jsonStart = rawContent.indexOf('{');
        if (jsonStart !== -1) {
            let braceCount = 0;
            let jsonEnd = -1;
            let inString = false;
            let escapeNext = false;
            for (let i = jsonStart; i < rawContent.length; i++) {
                const char = rawContent[i];
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === '{') {
                        braceCount++;
                    }
                    else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            jsonEnd = i + 1;
                            break;
                        }
                    }
                }
            }
            if (jsonEnd !== -1) {
                const extractedJson = rawContent.substring(jsonStart, jsonEnd);
                const parsed = JSON.parse(extractedJson);
                console.log('✅ [JSON-PARSER] Brace matching extraction successful');
                return { success: true, data: parsed, method: 'brace_matching' };
            }
        }
    }
    catch (braceError) {
        console.log('❌ [JSON-PARSER] Brace matching failed:', braceError instanceof Error ? braceError.message : 'Unknown error');
    }
    // Method 4: Clean and repair common JSON issues
    try {
        let cleaned = rawContent
            .trim()
            .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
            .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single quotes to double quotes
            .replace(/\\'/g, "'") // Unescape single quotes
            .replace(/\\\\/g, "\\"); // Fix double escaping
        // Find the main JSON object
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            cleaned = cleaned.substring(start, end + 1);
            // Try to fix unterminated strings by adding closing quotes
            const stringMatches = cleaned.match(/"[^"]*$/);
            if (stringMatches) {
                cleaned += '"';
            }
            const parsed = JSON.parse(cleaned);
            console.log('✅ [JSON-PARSER] Cleaning and repair successful');
            return { success: true, data: parsed, method: 'cleaned_repair' };
        }
    }
    catch (cleanError) {
        console.log('❌ [JSON-PARSER] Cleaning and repair failed:', cleanError instanceof Error ? cleanError.message : 'Unknown error');
    }
    // Method 5: Create fallback response with error details
    console.log('❌ [JSON-PARSER] All parsing methods failed, creating fallback response');
    const fallbackResponse = {
        overall_assessment: {
            risk_score: 10,
            risk_level: "medium",
            summary: "Analysis completed with JSON parsing issues. The AI service provided a response that could not be properly parsed due to formatting errors. This is a technical issue with the response format, not a content-based risk assessment. Manual review is recommended for comprehensive analysis.",
            recommendations: "1. Retry the analysis to potentially resolve parsing issues. 2. Conduct manual review of the document for comprehensive risk assessment. 3. Contact support if parsing issues persist across multiple attempts."
        },
        risk_assessments: [
            {
                category: "Technical Analysis Error",
                subcategory: "JSON Response Parsing",
                description: "AI response could not be properly parsed due to malformed JSON structure. This indicates a technical issue with the AI analysis service response format, not a content-based risk assessment.",
                likelihood: 2,
                impact: 3,
                risk_score: 6,
                risk_level: "medium",
                key_findings: [
                    "AI service response contained malformed JSON structure",
                    "Multiple parsing methods attempted without success",
                    "Technical issue prevents automated risk extraction",
                    "Document content was successfully processed by AI service"
                ],
                mitigation_strategies: [
                    "Retry analysis with same or different parameters",
                    "Conduct manual document review for comprehensive assessment",
                    "Monitor AI service response quality and report persistent issues",
                    "Implement additional response validation and cleanup mechanisms"
                ],
                regulatory_references: ["Internal Quality Assurance", "ISO 9001 Quality Management"],
                industry_best_practices: ["NIST Cybersecurity Framework", "ISO 27001 Information Security"],
                scoring_transparency: {
                    methodology: "Fallback scoring applied due to JSON parsing failure. This represents a technical assessment of system reliability rather than document content risk.",
                    likelihood_factors: {
                        score: 2,
                        reasoning: "Low likelihood as this represents a technical parsing issue rather than actual document risk content",
                        evidence_factors: [
                            {
                                factor: "Technical parsing error",
                                weight: "high",
                                evidence: "AI service response could not be parsed as valid JSON despite multiple parsing attempts",
                                contribution: "Primary factor indicating system issue rather than content risk"
                            },
                            {
                                factor: "Response format variability",
                                weight: "medium",
                                evidence: "AI services may occasionally produce responses with formatting inconsistencies",
                                contribution: "Moderate factor suggesting need for robust parsing mechanisms"
                            }
                        ]
                    },
                    impact_factors: {
                        score: 3,
                        reasoning: "Moderate impact as analysis completion is delayed but alternative assessment methods remain available",
                        evidence_factors: [
                            {
                                factor: "Analysis delay",
                                weight: "medium",
                                evidence: "Automated analysis failed but manual review and retry options remain available",
                                contribution: "Temporary delay in risk assessment delivery without permanent data loss"
                            },
                            {
                                factor: "Quality assurance impact",
                                weight: "low",
                                evidence: "Fallback mechanisms ensure analysis process continues with appropriate error handling",
                                contribution: "System maintains operational continuity through error recovery procedures"
                            }
                        ]
                    },
                    calculation_breakdown: {
                        formula: "Risk Score = Likelihood × Impact",
                        calculation: "2 × 3 = 6",
                        score_interpretation: "Medium risk level indicating technical issue requiring attention but not critical system failure",
                        confidence_level: "high",
                        uncertainty_factors: [
                            "AI service response format variability",
                            "JSON parsing complexity in large responses",
                            "Potential token limit truncation effects"
                        ]
                    },
                    document_evidence: {
                        supporting_quotes: [
                            "AI analysis service encountered response formatting issue during JSON parsing phase"
                        ],
                        contextual_factors: [
                            "Document content was successfully extracted and processed",
                            "AI service provided response but with formatting issues",
                            "Error occurred during response interpretation rather than content analysis"
                        ],
                        assumptions_made: [
                            "Document content is valid and was processed by AI service",
                            "Technical issue is temporary and not content-related",
                            "Manual review can provide comprehensive risk assessment",
                            "Retry attempts may resolve parsing issues"
                        ]
                    }
                }
            }
        ]
    };
    return {
        success: false,
        data: fallbackResponse,
        error: "All JSON parsing methods failed",
        method: 'fallback'
    };
}
exports.cleanAndParseAiJson = cleanAndParseAiJson;
function validateAnalysisStructure(analysis) {
    try {
        // Check required top-level structure
        if (!analysis || typeof analysis !== 'object') {
            return false;
        }
        // Check overall_assessment
        if (!analysis.overall_assessment || typeof analysis.overall_assessment !== 'object') {
            return false;
        }
        const assessment = analysis.overall_assessment;
        if (typeof assessment.risk_score !== 'number' ||
            typeof assessment.risk_level !== 'string' ||
            typeof assessment.summary !== 'string' ||
            typeof assessment.recommendations !== 'string') {
            return false;
        }
        // Check risk_assessments array
        if (!Array.isArray(analysis.risk_assessments)) {
            return false;
        }
        // Validate each risk assessment
        for (const risk of analysis.risk_assessments) {
            if (!risk || typeof risk !== 'object') {
                return false;
            }
            const requiredFields = [
                'category', 'subcategory', 'description',
                'likelihood', 'impact', 'risk_score', 'risk_level'
            ];
            for (const field of requiredFields) {
                if (!(field in risk)) {
                    return false;
                }
            }
            // Validate numeric fields
            if (typeof risk.likelihood !== 'number' ||
                typeof risk.impact !== 'number' ||
                typeof risk.risk_score !== 'number') {
                return false;
            }
            // Validate arrays
            if (!Array.isArray(risk.key_findings) ||
                !Array.isArray(risk.mitigation_strategies) ||
                !Array.isArray(risk.regulatory_references) ||
                !Array.isArray(risk.industry_best_practices)) {
                return false;
            }
        }
        return true;
    }
    catch (error) {
        console.log('❌ [JSON-PARSER] Structure validation failed:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}
exports.validateAnalysisStructure = validateAnalysisStructure;
