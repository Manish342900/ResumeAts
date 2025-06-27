import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChatBot from './ChatBot';
import './AnalysisResults.css';
import axiosInstance from '../axiosInstance';

function AnalysisResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    score,
    suggestions,
    fullAnalysis,
    file,
    linkResults,
    keySkills,
    areasNeedingImprovement,
    error: locationError
  } = location.state || {};
  const [fileUrl, setFileUrl] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state && !id) {
      navigate('/analyze', { replace: true });
    }
  }, [location.state, id, navigate]);

  // PDF blob preview (only for uploads, not history)
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (loading) return <div className="loading">Loading analysis details...</div>;
  if (error) return <div className="error">{error}</div>;

  if (locationError) {
    return (
      <div className="analysis-results-page">
        <div className="not-cv-container">
          <div className="not-cv-icon" role="img" aria-label="Not a CV">📄❌</div>
          <h2>Oops! This doesn't look like a CV or Resume</h2>
          <p className="not-cv-message">{locationError || 'The file you uploaded does not appear to be a formatted CV or resume. Please upload a valid CV or resume document in PDF format.'}</p>
          <a href="/analyze" className="not-cv-back-btn">Try Again</a>
        </div>
      </div>
    );
  }

  // Use either location.state or fetched analysisData
  const data = location.state || analysisData;
  if (!data) return null;

  const scoreVal = data.score || data.atsScore || null;
  const suggestionsVal = data.suggestions || data.suggestionsBySection || {};
  const fullAnalysisVal = data.fullAnalysis || data.analysis || null;
  const linkResultsVal = data.linkResults || [];
  const keySkillsVal = data.keySkills || [];
  const areasNeedingImprovementVal = data.areasNeedingImprovement || [];

  const getScoreColor = (score) => {
    if (score === null) return '#666';
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const getScoreMessage = (score) => {
    if (score === null) return 'N/A';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const sectionOrder = [
    'Profile', 'Experience', 'Education', 'Skills', 'Projects',
    'Achievements', 'Certifications', 'Languages', 'Links', 'Other'
  ];

  // Merge suggestions from backend (object format)
  const groupedSuggestions = { ...(suggestionsVal || {}) };

  // Add invalid link errors to 'Links' section
  if (linkResultsVal?.length) {
    const invalidLinks = linkResultsVal.filter(link => !link.isValid);
    if (invalidLinks.length) {
      if (!groupedSuggestions['Links']) groupedSuggestions['Links'] = [];
      invalidLinks.forEach(link => {
        groupedSuggestions['Links'].push(`Invalid link found: ${link.url} - ${link.error}`);
      });
    }
  }

  // Sort sections according to predefined order
  const sortedSections = Object.entries(groupedSuggestions)
    .sort(([a], [b]) => {
      const indexA = sectionOrder.indexOf(a);
      const indexB = sectionOrder.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

  return (
    <div className="analysis-results-page">
      <div className="analysis-container">
        <div className="left-panel">
          <div className="score-section">
            <div className="score-circle" style={{ borderColor: getScoreColor(scoreVal) }}>
              <span className="score-value">{scoreVal}</span>
              <span className="score-label">ATS Score</span>
            </div>
            <div className="score-bar">
              <div
                className="score-bar-inner"
                style={{ width: scoreVal ? `${scoreVal}%` : '0%' }}
              ></div>
            </div>
            <div className="score-message" style={{ color: getScoreColor(scoreVal) }}>
              {getScoreMessage(scoreVal)}
            </div>
          </div>

          {fullAnalysisVal && (
            <div className="full-analysis-summary">
              <h3>Summary</h3>
              <p>{typeof fullAnalysisVal === 'string' ? fullAnalysisVal : fullAnalysisVal.summary}</p>
            </div>
          )}

          {keySkillsVal?.length > 0 && (
            <div className="suggestion-group">
              <h3 className="section-heading">Key Skills Found</h3>
              <ul className="suggestion-list">
                {keySkillsVal.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {areasNeedingImprovementVal?.length > 0 && (
            <div className="suggestion-group">
              <h3 className="section-heading">Areas Needing Improvement</h3>
              <ul className="suggestion-list">
                {areasNeedingImprovementVal.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="suggestions-section">
            {sortedSections.map(([section, items]) => (
              <div key={section} className="suggestion-group">
                <h3 className="section-heading">{section}</h3>
                <ul className="suggestion-list">
                  {items.map((item, index) => (
                    <li key={index} className="suggestion-item">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          {fileUrl && (
            <iframe
              src={fileUrl}
              title="Resume Preview"
              className="pdf-preview"
            />
          )}
        </div>
      </div>
      <ChatBot analysisData={{ score: scoreVal, suggestions: suggestionsVal, fullAnalysis: fullAnalysisVal } } file={file} />
    </div>
  );
}

export default AnalysisResults;
