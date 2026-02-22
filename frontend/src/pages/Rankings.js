import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowLeft, Brain, TrendingUp, Briefcase, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Rankings = () => {
  const { companyId } = useParams();
  const [rankings, setRankings] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [companyId]);

  const fetchRankings = async () => {
    try {
      const [rankingsRes, companyRes] = await Promise.all([
        axios.get(`${API}/rankings/${companyId}`),
        axios.get(`${API}/companies/${companyId}`)
      ]);

      setRankings(rankingsRes.data);
      setCompany(companyRes.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      if (error.response?.status === 404) {
        toast.error('No rankings found. Please run matching first.');
      } else {
        toast.error('Failed to load rankings');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-slate-600 font-semibold">{rank}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  // Prepare data for top 5 candidates comparison chart
  const comparisonData = rankings.slice(0, 5).map(match => ({
    name: match.student_name.split(' ')[0],
    Skills: match.skill_similarity_score,
    CGPA: match.cgpa_score,
    Internships: match.internship_score,
    Sentiment: match.sentiment_weight
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-slate-600 font-medium">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="glass-card p-12">
            <Brain className="w-20 h-20 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">No Rankings Yet</h2>
            <p className="text-slate-600 mb-6">Please run AI matching first to see ranked candidates</p>
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="back-dashboard-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-card p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2">
                  {company?.name}
                </h1>
                <p className="text-slate-600 mb-4">{company?.job_description}</p>
                <div className="flex flex-wrap gap-2">
                  {company?.required_skills.split(',').map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Matches</p>
                <p className="text-3xl font-bold font-heading text-blue-600">{rankings.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className="md:order-1 order-2">
                <Card className="glass-card border-0 h-full">
                  <CardContent className="p-6 text-center">
                    <Medal className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-semibold font-heading text-slate-900 mb-1">
                      {rankings[1].student_name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{rankings[1].student_email}</p>
                    <div className="text-3xl font-bold font-heading text-blue-600 mb-2">
                      {rankings[1].final_score}%
                    </div>
                    <Badge className="bg-gray-100 text-gray-700">2nd Place</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="md:order-2 order-1">
                <Card className="glass-card border-0 h-full border-2 border-yellow-400">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
                    <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">
                      {rankings[0].student_name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{rankings[0].student_email}</p>
                    <div className="text-4xl font-bold font-heading text-green-600 mb-2">
                      {rankings[0].final_score}%
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">Top Rank</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 order-3">
                <Card className="glass-card border-0 h-full">
                  <CardContent className="p-6 text-center">
                    <Award className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                    <h3 className="text-lg font-semibold font-heading text-slate-900 mb-1">
                      {rankings[2].student_name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{rankings[2].student_email}</p>
                    <div className="text-3xl font-bold font-heading text-orange-600 mb-2">
                      {rankings[2].final_score}%
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">3rd Place</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparison Chart */}
        {rankings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Top 5 Candidates - Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Skills" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="CGPA" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Internships" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Sentiment" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Complete Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((match, idx) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 hover:shadow-md transition-all"
                    data-testid={`ranking-card-${idx}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center">
                        {getRankIcon(match.rank)}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold font-heading text-slate-900">
                              {match.student_name}
                            </h3>
                            <p className="text-sm text-slate-600">{match.student_email}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold font-heading ${getScoreColor(match.final_score)}`}>
                              {match.final_score}%
                            </div>
                            <p className="text-xs text-slate-500">Match Score</p>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">CGPA</p>
                            <p className="text-lg font-semibold text-slate-900">{match.cgpa}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Internships</p>
                            <p className="text-lg font-semibold text-slate-900">{match.internships}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Sentiment</p>
                            <Badge
                              variant="secondary"
                              className={`
                                ${match.sentiment_label === 'Positive' ? 'bg-green-100 text-green-700' : ''}
                                ${match.sentiment_label === 'Neutral' ? 'bg-gray-100 text-gray-700' : ''}
                                ${match.sentiment_label === 'Negative' ? 'bg-red-100 text-red-700' : ''}
                              `}
                            >
                              {match.sentiment_label}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Skills Found</p>
                            <p className="text-lg font-semibold text-slate-900">{match.extracted_skills.length}</p>
                          </div>
                        </div>

                        {/* Skills */}
                        {match.extracted_skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-2">Extracted Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {match.extracted_skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Score Breakdown */}
                        <div className="grid md:grid-cols-4 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">Skills</span>
                              <span className="text-xs font-semibold text-slate-900">{match.skill_similarity_score}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${match.skill_similarity_score}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">CGPA</span>
                              <span className="text-xs font-semibold text-slate-900">{match.cgpa_score}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-600 rounded-full transition-all"
                                style={{ width: `${match.cgpa_score}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">Experience</span>
                              <span className="text-xs font-semibold text-slate-900">{match.internship_score}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full transition-all"
                                style={{ width: `${match.internship_score}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">Sentiment</span>
                              <span className="text-xs font-semibold text-slate-900">{match.sentiment_weight}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-600 rounded-full transition-all"
                                style={{ width: `${match.sentiment_weight}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Rankings;
