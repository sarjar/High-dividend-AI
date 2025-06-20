# AI-Powered Dividend Investment Research Platform

A comprehensive investment research platform that provides personalized ETF and stock recommendations using AI-powered analysis and real-time market data.

## 🚀 Features

### Core Functionality
- **AI Investment Consultant**: Interactive chat interface for investment advice and financial consultation
- **Personalized Research Reports**: Generate comprehensive ETF and stock recommendations based on user preferences
- **Real-time Market Analysis**: Live market data integration for current investment opportunities
- **Dividend Focus**: Specialized in high-dividend ETFs and dividend-paying stocks
- **Multi-source Data**: Aggregates data from multiple financial sources for comprehensive analysis

### User Experience
- **Intuitive Interface**: Clean, responsive design built with Radix UI components
- **Preference-based Filtering**: Filter by sectors, regions, and dividend yield ranges
- **Interactive Chat**: Natural language queries for investment advice
- **Report Generation**: Detailed analysis with tables, charts, and recommendations
- **History Management**: Save and manage chat history and research reports

### Security & Authentication
- **Secure Authentication**: Supabase-powered user management with enhanced security
- **Rate Limiting**: Protection against abuse with intelligent rate limiting
- **Input Validation**: Comprehensive validation for all user inputs
- **Analytics Tracking**: Monitor user interactions and system performance

## 🛠 Technology Stack

### Frontend
- **Next.js 15** (App Router) - React framework with server-side rendering
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons

### Backend & AI
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **OpenAI GPT-4** - Advanced language model for AI responses
- **LangChain** - Framework for building AI applications
- **LangGraph** - Workflow orchestration for complex AI tasks
- **LangSmith** - Monitoring and debugging for LangChain applications

### Data Sources
- **Alpha Vantage API** - Financial market data
- **Financial Dataset AI** - Comprehensive financial information
- **Web Scraping** - Real-time data from financial websites
- **Multiple ETF Sources** - Aggregated ETF and stock data

## 🏗 Architecture

### AI Workflow System
The platform uses LangGraph to orchestrate complex AI workflows:

1. **Guard Intent Node** - Validates input and determines workflow path
2. **Load Preferences Node** - Processes user investment preferences
3. **Generate Search Terms Node** - Creates optimized search queries
4. **Scrape Data Node** - Aggregates data from multiple sources
5. **Summarize Data Node** - AI-powered analysis and insights
6. **Format Report Node** - Generates user-friendly reports
7. **General Chat Node** - Handles conversational AI interactions

### Database Schema
- **Users Management** - User profiles and authentication
- **Investment Preferences** - User-specific investment criteria
- **Chat History** - Conversation logs and responses
- **Auth Events** - Security and analytics tracking
- **Rate Limits** - Abuse prevention and monitoring

### API Endpoints
- `/api/research` - Generate investment research reports
- `/api/chat` - AI consultant chat interface
- `/api/chat/clear` - Clear user chat history
- `/auth/callback` - Authentication callback handling

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Financial data API keys (Alpha Vantage, etc.)

### Environment Variables
Set up the following environment variables:

```env
# Supabase Configuration
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# Financial Data APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINANCIAL_DATASET_API_KEY=your_financial_dataset_key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd high-dividend-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   ```bash
   # Run database migrations
   npx supabase db push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Research Reports
1. Navigate to the Dashboard
2. Select your investment preferences:
   - Choose sectors (Technology, Finance, Healthcare, etc.)
   - Select regions (USA, Europe, Asia, Global, etc.)
   - Set dividend yield range (0-15%)
3. Click "Generate Research Report"
4. Review personalized ETF and stock recommendations

### AI Consultant
1. Go to the "AI Consultant" tab
2. Ask questions about:
   - Dividend investing strategies
   - ETF comparisons
   - Market analysis
   - Investment advice
3. Get real-time, personalized responses
4. Clear chat history when needed

### User Management
- **Sign Up**: Create account with email verification
- **Sign In**: Secure authentication with rate limiting
- **Password Reset**: Self-service password recovery
- **Profile Management**: Update preferences and settings

## 🔧 Development

### Project Structure
```
src/
├── agent/              # AI workflow system
│   ├── graph.ts        # LangGraph workflow definition
│   ├── nodes/          # Individual workflow nodes
│   ├── tools/          # AI tools and utilities
│   └── types.ts        # Type definitions
├── app/                # Next.js app router
│   ├── api/            # API endpoints
│   ├── (auth)/         # Authentication pages
│   └── dashboard/      # Main application
├── components/         # React components
│   ├── etf/            # Investment-specific components
│   ├── ui/             # Reusable UI components
│   └── layout/         # Layout components
├── lib/                # Utilities and constants
├── supabase/           # Database client configuration
└── utils/              # Helper functions
```

### Key Components
- **ResearchForm**: Main interface for generating investment reports
- **ChatInterface**: AI consultant chat with history management
- **UserProfile**: User authentication and profile management
- **ETF Components**: Investment-specific UI components

### Database Migrations
Database schema is managed through Supabase migrations:
```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation for all user inputs
- **Rate Limiting**: Prevents abuse with configurable limits
- **Authentication**: Secure user management with Supabase Auth
- **Error Handling**: Graceful error handling and user feedback
- **Analytics**: Track user interactions and system performance

## 📊 Monitoring & Analytics

- **Auth Events Tracking**: Monitor sign-ups, sign-ins, and security events
- **Rate Limit Monitoring**: Track and prevent abuse
- **Error Logging**: Comprehensive error tracking and debugging
- **Performance Metrics**: Monitor API response times and success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the error logs in the development console

## 🔮 Future Enhancements

- **Portfolio Tracking**: Track and monitor investment portfolios
- **Advanced Analytics**: More sophisticated market analysis
- **Mobile App**: React Native mobile application
- **Social Features**: Share research and collaborate with other investors
- **Advanced AI**: Enhanced AI models for better recommendations
- **Real-time Notifications**: Market alerts and portfolio updates

---

**Built with ❤️ for intelligent investing**
