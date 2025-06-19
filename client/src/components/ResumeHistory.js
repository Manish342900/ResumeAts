import React, { useState, useEffect } from 'react';
import './ResumeHistory.css';

const ResumeHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumeHistory();
  }, [user]);

  const fetchResumeHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resume-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume history');
      }

      const data = await response.json();
      setHistory(data.history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading resume history...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="resume-history">
      <h2>Resume Analysis History</h2>
      {history.length === 0 ? (
        <p className="no-history">No resume analysis history found.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item._id} className="history-item">
              <div className="history-header">
                <h3>{item.fileName}</h3>
                <span className="date">{formatDate(item.analyzedAt)}</span>
              </div>
              <div className="history-details">
                <div className="score">
                  <span className="label">ATS Score:</span>
                  <span className="value">{item.atsScore}</span>
                </div>
                <div className="industry">
                  <span className="label">Industry:</span>
                  <span className="value">{item.industry || 'Not specified'}</span>
                </div>
                <div className="actions">
                  {/* View Details button removed */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeHistory; 