console.log("Fixing remaining reports with null scores..."); 
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function fixNullScores() {
  const reports = await prisma.report.findMany({
    where: { 
      OR: [
        { overallRiskScore: null },
        { overallRiskScore: 0 }
      ]
    },
    include: { assessments: true }
  });
  
  console.log(`Found ${reports.length} reports with null/zero scores`);
  
  for (const report of reports) {
    if (report.assessments.length === 0) {
      console.log(`Skipping ${report.id} - no assessments`);
      continue;
    }
    
    const riskScores = report.assessments.map(a => a.riskScore);
    const avgScore = Math.round((riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length) * 10) / 10;
    
    const extremeCount = report.assessments.filter(a => a.riskLevel === "extreme").length;
    const highCount = report.assessments.filter(a => a.riskLevel === "high").length;
    const mediumCount = report.assessments.filter(a => a.riskLevel === "medium").length;
    
    let level = "low";
    if (extremeCount > 0 || avgScore >= 20) level = "extreme";
    else if (highCount > 0 || avgScore >= 15) level = "high";
    else if (mediumCount > 0 || avgScore >= 10) level = "medium";
    
    await prisma.report.update({
      where: { id: report.id },
      data: {
        overallRiskScore: avgScore,
        overallRiskLevel: level
      }
    });
    
    console.log(`Fixed ${report.id}: ${avgScore}/25 (${level})`);
  }
  
  await prisma.$disconnect();
  console.log("All reports fixed!");
}
fixNullScores();
