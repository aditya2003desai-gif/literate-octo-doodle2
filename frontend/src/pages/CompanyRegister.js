import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    required_skills: '',
    min_cgpa: '',
    job_description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.required_skills || !formData.min_cgpa || !formData.job_description) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/companies`, {
        name: formData.name,
        required_skills: formData.required_skills,
        min_cgpa: parseFloat(formData.min_cgpa),
        job_description: formData.job_description
      });

      toast.success('Company registered successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-2">
              Company Registration
            </h1>
            <p className="text-slate-600">
              Register your company and find the perfect candidates with AI matching
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="company-registration-form">
            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium">Company Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                placeholder="TechCorp Inc."
                required
                data-testid="company-name-input"
              />
            </div>

            <div>
              <Label htmlFor="required_skills" className="text-slate-700 font-medium">Required Skills *</Label>
              <Input
                id="required_skills"
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                placeholder="Python, React, Machine Learning, AWS"
                required
                data-testid="company-skills-input"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated skills</p>
            </div>

            <div>
              <Label htmlFor="min_cgpa" className="text-slate-700 font-medium">Minimum CGPA *</Label>
              <Input
                id="min_cgpa"
                name="min_cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.min_cgpa}
                onChange={handleChange}
                className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                placeholder="7.0"
                required
                data-testid="company-cgpa-input"
              />
            </div>

            <div>
              <Label htmlFor="job_description" className="text-slate-700 font-medium">Job Description *</Label>
              <Textarea
                id="job_description"
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                rows={6}
                className="mt-2 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl resize-none"
                placeholder="We are looking for a talented software engineer with strong skills in full-stack development..."
                required
                data-testid="company-description-input"
              />
              <p className="text-xs text-slate-500 mt-1">Detailed job description helps our AI match better candidates</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform"
              data-testid="company-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Register Company
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyRegister;
