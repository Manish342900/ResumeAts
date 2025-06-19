# ATS Resume Analyzer

An intelligent resume analysis system that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS) using AI technology.

## Features

- 📄 Resume Analysis: Upload and analyze PDF/Word resumes
- 🤖 AI-Powered Insights: Get detailed feedback and suggestions
- 💯 ATS Compatibility Score: Know how well your resume performs
- 🔗 Link Validation: Check if your resume links are working
- 💬 Interactive Chat: Get real-time assistance with your resume
- 📱 Responsive Design: Works on all devices

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- AI: OpenAI GPT-4
- File Processing: pdf-parse
- Styling: CSS3

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ats-resume-analyzer.git
cd ats-resume-analyzer
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

4. Create a .env file in the root directory:
```
PORT=5000
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. Start the client (in a new terminal):
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
ats-resume-analyzer/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── components/    # React components
│       ├── assets/        # Images and other assets
│       └── context/       # React context
├── uploads/               # Temporary file storage
├── server.js             # Express server
└── package.json          # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- The open-source community for various tools and libraries used in this project 