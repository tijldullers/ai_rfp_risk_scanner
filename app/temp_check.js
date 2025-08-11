console.log("Checking current report scores..."); 
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function checkReports() {
  const reports = await prisma.report.findMany({
    where: { fileName: "Request for Proposal Claim.docx" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { assessments: true }
  });
  console.log("Recent Request for Proposal Claim.docx reports:");
  reports.forEach(r => {
    console.log(`- ID: ${r.id}, Score: ${r.overallRiskScore}/25 (${r.overallRiskLevel}), Assessments: ${r.assessments.length}, Status: ${r.status}, Created: ${r.createdAt}`);
  });
  await prisma.$disconnect();
}
checkReports();
