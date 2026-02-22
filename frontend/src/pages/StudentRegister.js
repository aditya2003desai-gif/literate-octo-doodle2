import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cgpa: '',
    internships: '',
    skills: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.cgpa || !formData.internships) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create student
      const studentResponse = await axios.post(`${API}/students`, {
        name: formData.name,
        email: formData.email,
        cgpa: parseFloat(formData.cgpa),
        internships: parseInt(formData.internships),
        skills: formData.skills
      });

      const studentId = studentResponse.data.id;

      // Upload resume if provided
      if (file) {
        setUploadProgress('Uploading resume...');
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const uploadResponse = await axios.post(
          `${API}/students/${studentId}/upload-resume`,
          formDataUpload,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        setUploadProgress('Processing with AI...');
        
        toast.success(
          `Registration successful! Found ${uploadResponse.data.extracted_skills.length} skills. Sentiment: ${uploadResponse.data.sentiment_label}`,
          { duration: 5000 }
        );
      } else {
        toast.success('Registration successful!');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(null);
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
              Student Registration
            </h1>
            <p className="text-slate-600">
              Register your profile and upload your resume for AI-powered analysis
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="student-registration-form">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-slate-700 font-medium">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  placeholder="John Doe"
                  required
                  data-testid="student-name-input"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-700 font-medium">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  placeholder="john@example.com"
                  required
                  data-testid="student-email-input"
                />
              </div>

              <div>
                <Label htmlFor="cgpa" className="text-slate-700 font-medium">CGPA (out of 10) *</Label>
                <Input
                  id="cgpa"
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  placeholder="8.5"
                  required
                  data-testid="student-cgpa-input"
                />
              </div>

              <div>
                <Label htmlFor="internships" className="text-slate-700 font-medium">Number of Internships *</Label>
                <Input
                  id="internships"
                  name="internships"
                  type="number"
                  min="0"
                  value={formData.internships}
                  onChange={handleChange}
                  className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  placeholder="2"
                  required
                  data-testid="student-internships-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="skills" className="text-slate-700 font-medium">Skills (Optional)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="mt-2 h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                placeholder="Python, React, Machine Learning"
                data-testid="student-skills-input"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <Label className="text-slate-700 font-medium mb-2 block">Resume Upload (Optional)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-white/30">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="resume-file-input"
                />
                <label htmlFor="resume" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FileText className="w-6 h-6" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-slate-600 font-medium mb-1">Click to upload resume</p>
                      <p className="text-sm text-slate-500">PDF or TXT (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {file && (
                <p className="text-xs text-slate-500 mt-2">
                  Our AI will extract skills and analyze sentiment from your resume
                </p>
              )}
            </div>

            {uploadProgress && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl" data-testid="upload-progress">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-600 font-medium">{uploadProgress}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform"
              data-testid="student-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Registration
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentRegister;
