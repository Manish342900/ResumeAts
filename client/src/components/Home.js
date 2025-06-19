import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-bg-gradient">
      <div className="home-center-container">
        <h1 className="home-title">Optimize Your Resume for ATS</h1>
        <p className="home-subtitle">
          Get AI-powered analysis and suggestions to make your resume stand out to Applicant Tracking Systems
        </p>
        <Link to="/analyze" className="home-cta-button">
          Analyze Your Resume
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="arrow-icon">
            <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </Link>

        <div className="home-features-grid">
          <div className="home-feature-card home-slide-up">
            <div className="home-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>AI-Powered Analysis</h3>
            <p>Get detailed feedback on your resume's ATS compatibility using advanced AI technology</p>
          </div>
          <div className="home-feature-card home-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="home-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div>
            <h3>Smart Suggestions</h3>
            <p>Receive specific recommendations to improve your resume's content and format</p>
          </div>
          <div className="home-feature-card home-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="home-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>Personalized Feedback</h3>
            <p>Get tailored suggestions based on your industry and experience level</p>
          </div>
          <div className="home-feature-card home-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="home-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>Instant Results</h3>
            <p>Get your analysis and suggestions in seconds, no waiting required</p>
          </div>
        </div>

        <div className="home-how-it-works">
          <h2>How It Works</h2>
          <div className="home-steps">
            <div className="home-step home-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="home-step-number">1</div>
              <h3>Upload Your Resume</h3>
              <p>Upload your resume in PDF format</p>
            </div>
            <div className="home-step home-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="home-step-number">2</div>
              <h3>Get Analysis</h3>
              <p>Our AI analyzes your resume for ATS compatibility</p>
            </div>
            <div className="home-step home-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="home-step-number">3</div>
              <h3>Review Suggestions</h3>
              <p>Receive detailed feedback and improvement suggestions</p>
            </div>
          </div>
        </div>

        <div className="home-cta-section">
          <h2>Ready to Optimize Your Resume?</h2>
          <p>Get started now and increase your chances of landing interviews</p>
          <Link to="/analyze" className="home-cta-button">
            Start Analysis
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="arrow-icon">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home; 