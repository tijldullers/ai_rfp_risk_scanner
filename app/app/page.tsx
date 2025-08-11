
import { UploadSection } from '@/components/upload-section';
import { Header } from '@/components/header';
import { Features } from '@/components/features';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Uncover <span className="text-indigo-600">Hidden AI Risks</span> in Tender Documents
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover hidden AI risks in your tender documents with comprehensive regulatory compliance analysis including GDPR, NIS2, DORA, and EU AI Act frameworks
          </p>
        </div>

        {/* Upload Section */}
        <UploadSection />

        {/* Features Section */}
        <Features />
      </main>
    </div>
  );
}
