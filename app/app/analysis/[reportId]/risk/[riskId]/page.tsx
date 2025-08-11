
import { RiskDetailsView } from '@/components/risk-details-view';
import { Header } from '@/components/header';

interface RiskDetailsPageProps {
  params: { reportId: string; riskId: string };
}

export default function RiskDetailsPage({ params }: RiskDetailsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <RiskDetailsView reportId={params.reportId} riskId={params.riskId} />
      </main>
    </div>
  );
}
