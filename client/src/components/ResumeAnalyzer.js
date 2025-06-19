import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import './ResumeAnalyzer.css';

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [industry, setIndustry] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [formattingPreferences, setFormattingPreferences] = useState('');
  const navigate = useNavigate();

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (industry) formData.append('industry', industry);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    if (keywords) formData.append('keywords', keywords);
    if (formattingPreferences) formData.append('formattingPreferences', formattingPreferences);

    try {
      const response = await axiosInstance.post('/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;

      if (!data || !data.atsScore || !data.suggestionsBySection) {
        throw new Error('Incomplete analysis response');
      }

      navigate('/analysis-results', {
        state: {
          score: data.atsScore,
          suggestions: data.suggestionsBySection,
          keySkills: data.keySkills || [],
          areasNeedingImprovement: data.areasNeedingImprovement || [],
          fullAnalysis: data.fullAnalysis || {},
          file,
          linkResults: data.linkResults || [],
        },
        replace: true
      });
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  }, [
    file,
    industry,
    jobDescription,
    keywords,
    formattingPreferences,
    navigate
  ]);

  return (
    <div className="resume-analyzer">
      <h2>Resume Analyzer</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          <label className="file-input-label">
            {file ? file.name : 'Choose PDF file'}
          </label>
        </div>

        <input
          type="text"
          placeholder="Industry (optional)"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          className="industry-input"
        />
        <textarea
          placeholder="Job Description (optional)"
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          className="job-description-input"
        />
        <input
          type="text"
          placeholder="Keywords (optional)"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          className="keywords-input"
        />
        <textarea
          placeholder="Formatting Preferences (optional)"
          value={formattingPreferences}
          onChange={e => setFormattingPreferences(e.target.value)}
          className="formatting-preferences-input"
        />

        <button
          type="submit"
          disabled={loading || !file}
          className="analyze-button"
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ResumeAnalyzer;
