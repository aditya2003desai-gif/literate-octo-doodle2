import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Building2, FileText, TrendingUp, ArrowLeft, Sparkles, Brain, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes, companiesRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/students`),
        axios.get(`${API}/companies`)
      ]);

      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatching = async (companyId) => {
    try {
      toast.loading('Running AI matching...', { id: 'matching' });
      const response = await axios.post(`${API}/match/${companyId}`);
      toast.success(`Matching complete! Found ${response.data.total_matches} matches`, { id: 'matching' });
      
      setTimeout(() => {
        navigate(`/rankings/${companyId}`);
      }, 1000);
    } catch (error) {
      console.error('Matching error:', error);
      toast.error(error.response?.data?.detail || 'Matching failed', { id: 'matching' });
    }
  };

  const sentimentData = stats ? [
    { name: 'Positive', value: stats.sentiment_distribution.Positive, color: '#0D9488' },
    { name: 'Neutral', value: stats.sentiment_distribution.Neutral, color: '#7C3AED' },
    { name: 'Negative', value: stats.sentiment_distribution.Negative, color: '#EF4444' }
  ] : [];

  const skillsData = stats ? Object.entries(stats.top_skills).map(([skill, count]) => ({
    skill,
    count
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/">
              <Button variant="ghost" className="mb-4" data-testid="back-home-btn">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2">
              Placement Dashboard
            </h1>
            <p className="text-slate-600">AI-powered insights and analytics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-0" data-testid="stat-students-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold font-heading text-slate-900">{stats?.total_students || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">{stats?.students_with_resume || 0} with resumes</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-0" data-testid="stat-companies-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Companies</p>
                    <p className="text-3xl font-bold font-heading text-slate-900">{stats?.total_companies || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Registered employers</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-0" data-testid="stat-processed-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">AI Processed</p>
                    <p className="text-3xl font-bold font-heading text-slate-900">{stats?.students_with_resume || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Resumes analyzed</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        {stats && stats.students_with_resume > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-heading">Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-heading">Top Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={skillsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Companies List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Registered Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 mb-4">No companies registered yet</p>
                  <Link to="/company/register">
                    <Button data-testid="register-first-company-btn">
                      Register First Company
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company, idx) => (
                    <div
                      key={company.id}
                      className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 hover:shadow-md transition-all"
                      data-testid={`company-card-${idx}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold font-heading text-slate-900 mb-2">
                            {company.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {company.job_description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {company.required_skills.split(',').slice(0, 5).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-slate-600">
                            Min CGPA: <span className="font-semibold text-slate-900">{company.min_cgpa}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleRunMatching(company.id)}
                            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white"
                            data-testid={`run-matching-btn-${idx}`}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Run Matching
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/rankings/${company.id}`)}
                            className="bg-white/50 backdrop-blur-sm"
                            data-testid={`view-rankings-btn-${idx}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Rankings
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Registered Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 mb-4">No students registered yet</p>
                  <Link to="/student/register">
                    <Button data-testid="register-first-student-btn">
                      Register First Student
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">CGPA</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Internships</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Skills</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Sentiment</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-white/50" data-testid={`student-row-${idx}`}>
                          <td className="py-4 px-4 text-sm font-medium text-slate-900">{student.name}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{student.email}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {student.cgpa}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center text-sm text-slate-600">{student.internships}</td>
                          <td className="py-4 px-4 text-center">
                            {student.extracted_skills && student.extracted_skills.length > 0 ? (
                              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                                {student.extracted_skills.length} skills
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {student.sentiment_label ? (
                              <Badge
                                variant="secondary"
                                className={`
                                  ${student.sentiment_label === 'Positive' ? 'bg-green-100 text-green-700' : ''}
                                  ${student.sentiment_label === 'Neutral' ? 'bg-gray-100 text-gray-700' : ''}
                                  ${student.sentiment_label === 'Negative' ? 'bg-red-100 text-red-700' : ''}
                                `}
                              >
                                {student.sentiment_label}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {student.resume_text ? (
                              <FileText className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-xs text-slate-400">No resume</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
