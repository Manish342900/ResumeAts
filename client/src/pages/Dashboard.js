import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/profile').then((res) => {
      setUser(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  useEffect(() => {
    // Call the no-op endpoint once on mount
    axiosInstance.get('/noop').catch(() => {});
  }, []);

  if (!user) {
    navigate('/login');
    return <p>User data not available.</p>;
  }

  return (
    <div className="dashboard-bg-gradient">
      <div className="dashboard-center-container">
        <div className="dashboard-glass-card dashboard-fade-in">
          <h1 className="dashboard-title">Welcome back, {user.name}!</h1>
          <p className="dashboard-subtitle">Optimize your resume and track your progress</p>

          <div className="dashboard-grid">
            <Link to="/analyze" className="dashboard-card dashboard-3d-card dashboard-slide-up">
              <div className="card-content">
                <div className="card-icon">📝</div>
                <h2>Analyze Resume</h2>
                <p>Upload your resume for ATS optimization and scoring</p>
              </div>
              <div className="card-action">
                <span>Get Started →</span>
              </div>
            </Link>

            <Link to="/history" className="dashboard-card dashboard-3d-card dashboard-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="card-content">
                <div className="card-icon">📊</div>
                <h2>Resume History</h2>
                <p>View your past analyses and track improvements</p>
              </div>
              <div className="card-action">
                <span>View History →</span>
              </div>
            </Link>

            <div className="dashboard-card dashboard-3d-card dashboard-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="card-content">
                <div className="card-icon">📈</div>
                <h2>Your Progress</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{user.resumeAnalysed}</span>
                    <span className="stat-label">Resumes Analyzed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card dashboard-3d-card dashboard-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="card-content">
                <div className="card-icon">💡</div>
                <h2>Quick Tips</h2>
                <ul className="tips-list">
                  <li>Keep your resume concise and focused</li>
                  <li>Use relevant keywords from job descriptions</li>
                  <li>Highlight measurable achievements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
