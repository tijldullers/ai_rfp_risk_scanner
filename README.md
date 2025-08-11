
# AI RFP Risk Scanner

A comprehensive Next.js web application for analyzing AI procurement RFPs (Request for Proposals) and identifying potential risks using advanced LLM-powered analysis with comprehensive regulatory compliance mapping.

## 🌟 Features

- **Document Upload & Analysis**: Support for multiple document formats (PDF, DOCX, TXT)
- **Comprehensive Risk Assessment**: Analyzes across 40+ risk categories with detailed taxonomy
- **Regulatory Compliance Mapping**: Integrated compliance with GDPR, NIS2, DORA, EU AI Act, AI RMF, and OWASP
- **Industry Best Practices**: Links to official sources and framework guides
- **Real-time Analysis**: Live progress tracking and status updates
- **Interactive Dashboard**: Modern UI with detailed risk visualization
- **Database Storage**: Persistent storage with PostgreSQL and Prisma
- **Authentication**: Secure user authentication with NextAuth.js

## 📋 Risk Taxonomy Coverage

The system analyzes risks across comprehensive categories including:

### Technical Risks
- Data Quality & Integrity
- Model Performance & Accuracy
- Scalability & Performance
- Integration & Interoperability
- Cybersecurity & Privacy

### Operational Risks
- Vendor Management
- Implementation Timeline
- Resource Allocation
- Change Management
- Business Continuity

### Compliance & Regulatory
- Data Protection (GDPR)
- AI Governance (EU AI Act)
- Financial Regulations (DORA)
- Cybersecurity (NIS2)
- Industry Standards

### Ethical & Social
- Bias & Fairness
- Transparency & Explainability
- Human Oversight
- Social Impact
- Stakeholder Trust

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and yarn
- PostgreSQL database
- Git

### Development Environment Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd ai_rfp_risk_scanner
   ```

2. **Install Dependencies**
   ```bash
   cd app
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables:
   # - DATABASE_URL (PostgreSQL connection string)
   # - NEXTAUTH_URL (http://localhost:3000 for development)
   # - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
   # - ABACUSAI_API_KEY (for LLM analysis)
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

### Production Environment Setup

1. **Build the Application**
   ```bash
   cd app
   yarn build
   ```

2. **Start Production Server**
   ```bash
   yarn start
   ```

3. **Environment Variables for Production**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-production-secret
   ABACUSAI_API_KEY=your-api-key
   ```

## 🏗️ Project Structure

```
ai_rfp_risk_scanner/
├── app/                          # Next.js application root
│   ├── app/                      # App router structure
│   │   ├── api/                  # API routes
│   │   │   ├── analyze/         # Document analysis endpoint
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── reports/         # Report management
│   │   │   └── upload/          # File upload handling
│   │   ├── dashboard/           # Main dashboard pages
│   │   ├── reports/             # Report viewing pages
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   ├── analysis-results.tsx # Analysis results display
│   │   ├── file-upload.tsx      # File upload component
│   │   ├── risk-assessment-list.tsx # Risk list display
│   │   └── navigation.tsx       # Main navigation
│   ├── lib/                     # Utility libraries
│   │   ├── analysis-engine.ts   # Core analysis logic
│   │   ├── json-parser.ts       # LLM response parser
│   │   ├── risk-taxonomy.ts     # Risk categorization
│   │   └── database.ts          # Database utilities
│   ├── prisma/                  # Database schema and migrations
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Database seeding
│   ├── public/                  # Static assets
│   ├── types/                   # TypeScript type definitions
│   └── uploads/                 # Uploaded documents storage
├── scripts/                     # Utility scripts
├── tests/                       # Test files
└── docs/                        # Documentation
```

## 🔧 Key Components

### Analysis Engine (`lib/analysis-engine.ts`)
- Processes uploaded documents
- Interfaces with LLM for risk analysis
- Manages comprehensive taxonomy coverage
- Handles regulatory compliance mapping

### JSON Parser (`lib/json-parser.ts`)
- Parses and validates LLM responses
- Ensures data integrity and structure
- Handles error recovery and validation

### Risk Taxonomy (`lib/risk-taxonomy.ts`)
- Defines comprehensive risk categories
- Maps risks to regulatory frameworks
- Provides industry best practice references

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **Users**: Authentication and user management
- **Reports**: Analysis reports and metadata
- **RiskAssessments**: Individual risk evaluations
- **RegulatoryReferences**: Compliance mappings
- **IndustryBestPractices**: Best practice links

## 🔐 Authentication

Built with NextAuth.js supporting:
- Email/password authentication
- Session management
- Protected routes
- User role management

## 🧪 Testing

Run tests with:
```bash
# Unit tests
yarn test

# Integration tests
yarn test:integration

# E2E tests
yarn test:e2e
```

## 📈 Monitoring & Logging

The application includes comprehensive logging for:
- Analysis process tracking
- Error monitoring and recovery
- Performance metrics
- User activity tracking

## 🔄 API Endpoints

### Analysis
- `POST /api/analyze` - Analyze uploaded document
- `GET /api/reports/:id` - Get analysis results
- `GET /api/reports` - List user reports

### File Management
- `POST /api/upload` - Upload document files
- `GET /api/uploads/:filename` - Retrieve uploaded files

### User Management
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get user session

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application base URL | Yes |
| `NEXTAUTH_SECRET` | JWT signing secret | Yes |
| `ABACUSAI_API_KEY` | LLM API key | Yes |

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

#### Docker
```dockerfile
# Build and run with Docker
docker build -t ai-rfp-scanner .
docker run -p 3000:3000 ai-rfp-scanner
```

#### Traditional Server
1. Build the application: `yarn build`
2. Start with PM2: `pm2 start ecosystem.config.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Changelog

### Recent Updates
- ✅ Comprehensive regulatory compliance mapping integration
- ✅ Enhanced risk taxonomy with 40+ categories
- ✅ Improved LLM response parsing and validation
- ✅ Memory optimization and crash prevention
- ✅ Real-time analysis progress tracking
- ✅ Enhanced UI with regulatory reference links

## 🐛 Known Issues & Solutions

### Analysis Crashes
- **Issue**: Memory crashes during large document analysis
- **Solution**: Implemented memory management and chunking

### JSON Parsing Errors
- **Issue**: Malformed LLM responses causing parse failures
- **Solution**: Enhanced validation and error recovery

### Missing Regulatory References
- **Issue**: Compliance mapping not displaying
- **Solution**: Integrated comprehensive regulatory framework mapping

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include error logs and reproduction steps

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Next.js, TypeScript, PostgreSQL, and AI-powered analysis**
