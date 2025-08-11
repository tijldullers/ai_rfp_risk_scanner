
import { EnhancedAnalysisResults } from '@/components/enhanced-analysis-results';
import { Header } from '@/components/header';

interface AnalysisPageProps {
  params: { reportId: string };
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <EnhancedAnalysisResults reportId={params.reportId} />
      </main>
    </div>
  );
}
