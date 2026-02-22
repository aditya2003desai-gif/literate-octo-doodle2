import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Brain, ArrowRight, Sparkles, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Advanced NLP algorithms analyze resumes and match candidates with perfect precision'
    },
    {
      icon: Target,
      title: 'Smart Skill Extraction',
      description: 'Automatically extract and categorize technical skills from resumes'
    },
    {
      icon: TrendingUp,
      title: 'Sentiment Analysis',
      description: 'Understand candidate mindset through advanced sentiment scoring'
    },
    {
      icon: Award,
      title: 'Intelligent Ranking',
      description: 'Multi-factor scoring system ranks candidates by relevance'
    }
  ];

  const stats = [
    { value: '95%', label: 'Match Accuracy' },
    { value: '10x', label: 'Faster Hiring' },
    { value: '500+', label: 'Placements' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-md border-b border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-heading gradient-text">PlacementAI</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Link to="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:text-blue-600" data-testid="nav-dashboard-btn">
                Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">AI-Powered Recruitment</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold font-heading tracking-tight text-slate-900 mb-6">
                Connecting Talent with
                <span className="gradient-text"> Opportunity</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Transform your placement process with intelligent resume analysis, sentiment scoring, and AI-driven candidate matching. Find the perfect fit, every time.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/student/register">
                  <Button 
                    size="lg" 
                    className="h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform"
                    data-testid="hero-student-register-btn"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Register as Student
                  </Button>
                </Link>
                
                <Link to="/company/register">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 rounded-full bg-white/50 backdrop-blur-md border-white/60 hover:bg-white/80 hover:shadow-md transition-all"
                    data-testid="hero-company-register-btn"
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    Register Company
                  </Button>
                </Link>
              </div>
              
              <div className="flex gap-8 mt-12">
                {stats.map((stat, idx) => (
                  <div key={idx} data-testid={`stat-${idx}`}>
                    <div className="text-3xl font-bold text-blue-600 font-heading">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative glass-card p-8 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img 
                  src="https://images.unsplash.com/photo-1728511840262-549724e5149a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHw0fHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBwcm9mZXNzaW9uYWwlMjBwbGFjZW1lbnQlMjBzdWNjZXNzfGVufDB8fHx8MTc3MTc1ODU0M3ww&ixlib=rb-4.1.0&q=85"
                  alt="Success"
                  className="w-full h-auto rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our intelligent platform uses cutting-edge NLP and machine learning to revolutionize campus placements
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden glass-card p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                data-testid={`feature-card-${idx}`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold font-heading text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-violet-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">
                Ready to Transform Your Placements?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Join hundreds of institutions using PlacementAI to connect talent with opportunity
              </p>
              <Link to="/dashboard">
                <Button 
                  size="lg"
                  className="h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform"
                  data-testid="cta-dashboard-btn"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/50 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center text-slate-600">
          <p>&copy; 2024 PlacementAI. Powered by Advanced NLP & Machine Learning.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
