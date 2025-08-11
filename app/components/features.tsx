
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, BarChart3, Mail, Users, Download } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Comprehensive Risk Analysis',
    description: 'Analysis against 831 AI risk mitigation strategies from MIT taxonomy'
  },
  {
    icon: FileText,
    title: 'Multi-Format Support',
    description: 'Upload PDF, DOC, or DOCX documents for instant analysis'
  },
  {
    icon: BarChart3,
    title: 'Visual Risk Insights',
    description: 'Interactive charts and prioritized risk visualizations'
  },
  {
    icon: Mail,
    title: 'Email Reports',
    description: 'Get detailed PDF reports delivered to your email'
  },
  {
    icon: Users,
    title: 'Dual Perspectives',
    description: 'Analyze from both buyer and supplier viewpoints'
  },
  {
    icon: Download,
    title: 'Regulatory Compliance',
    description: 'Aligned with GDPR, NIS2, DORA, and EU AI Act requirements'
  }
];

export function Features() {
  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Unveiling Hidden Risks with Advanced Analysis
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
