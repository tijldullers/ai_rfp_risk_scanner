SELECT COUNT(*) as total_assessments, COUNT(CASE WHEN documentEvidence IS NOT NULL THEN 1 END) as with_evidence FROM RiskAssessment;
