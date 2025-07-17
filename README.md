# AI-Powered Document Analyzer

A sophisticated document analysis tool that leverages OpenAI's GPT models to extract insights, generate summaries, and answer questions about uploaded documents.

## Features

- **Document Upload**: Support for PDF, TXT, and DOCX files
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent document processing
- **Smart Summarization**: Generates concise summaries of any length document
- **Question Answering**: Ask specific questions about document content
- **Key Insights Extraction**: Automatically identifies important themes and concepts
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, Python
- **AI/ML**: OpenAI GPT-4 API
- **Document Processing**: PyPDF2, python-docx
- **Deployment**: Fly.io (backend), Vercel (frontend)

## Setup Instructions

### Backend Setup
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env)**:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

- `POST /upload` - Upload and process document
- `POST /analyze` - Analyze document content
- `POST /summarize` - Generate document summary
- `POST /question` - Ask questions about document

## Demo

[Live Demo](https://your-deployed-app-url.com)

## Screenshots

![Document Upload Interface](screenshots/upload.png)
![Analysis Results](screenshots/analysis.png)

## Author

Created by **Anand Chunduri** - [GitHub](https://github.com/anandc1)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
