
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLikelihoodImpactScores() {
  try {
    console.log('🔧 Starting likelihood/impact score correction for existing assessments...');
    
    // Find all assessments with likelihood or impact score of 1 (the fallback default)
    const brokenAssessments = await prisma.riskAssessment.findMany({
      where: {
        OR: [
          { likelihoodScore: 1 },
          { impactScore: 1 }
        ]
      }
    });
    
    console.log(`📊 Found ${brokenAssessments.length} assessments with potentially incorrect likelihood/impact scores`);
    
    let fixedCount = 0;
    
    for (const assessment of brokenAssessments) {
      const currentLikelihood = assessment.likelihoodScore;
      const currentImpact = assessment.impactScore;
      const currentRiskScore = assessment.riskScore;
      const expectedScore = currentLikelihood * currentImpact;
      
      // Only fix if there's a clear discrepancy
      if (currentRiskScore !== expectedScore && currentRiskScore > 0) {
        console.log(`🔍 Fixing assessment: ${assessment.subcategoryName || assessment.categoryName}`);
        console.log(`   Current: L:${currentLikelihood} × I:${currentImpact} = ${expectedScore}, but stored risk score: ${currentRiskScore}`);
        
        // Calculate reasonable likelihood and impact scores from the risk score
        let newLikelihood = currentLikelihood;
        let newImpact = currentImpact;
        
        // Find factors of the risk score
        const factors = [];
        for (let i = 1; i <= 5; i++) {
          if (currentRiskScore % i === 0 && currentRiskScore / i <= 5) {
            factors.push({ likelihood: i, impact: currentRiskScore / i });
          }
        }
        
        if (factors.length > 0) {
          // Select the most balanced factor pair
          const bestFactor = factors.reduce((best, current) => 
            Math.abs(current.likelihood - current.impact) < Math.abs(best.likelihood - best.impact) 
              ? current : best
          );
          
          newLikelihood = bestFactor.likelihood;
          newImpact = bestFactor.impact;
        } else {
          // For non-perfect factors, distribute as evenly as possible
          const sqrt = Math.sqrt(currentRiskScore);
          newLikelihood = Math.min(5, Math.max(1, Math.round(sqrt)));
          newImpact = Math.min(5, Math.max(1, Math.round(currentRiskScore / newLikelihood)));
        }
        
        // Update the assessment
        await prisma.riskAssessment.update({
          where: { id: assessment.id },
          data: {
            likelihoodScore: newLikelihood,
            impactScore: newImpact
          }
        });
        
        console.log(`   ✅ Fixed: L:${newLikelihood} × I:${newImpact} = ${newLikelihood * newImpact} (target: ${currentRiskScore})`);
        fixedCount++;
      } else {
        console.log(`   ✓ Assessment "${assessment.subcategoryName || assessment.categoryName}" is already correct`);
      }
    }
    
    console.log(`🎉 Successfully fixed ${fixedCount} assessments with incorrect likelihood/impact scores`);
    
  } catch (error) {
    console.error('❌ Error fixing likelihood/impact scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLikelihoodImpactScores();
