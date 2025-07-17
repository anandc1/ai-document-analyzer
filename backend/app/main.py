from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from typing import Optional
import PyPDF2
import docx
import io
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Document Analyzer", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

documents = {}

class AnalysisRequest(BaseModel):
    document_id: str
    analysis_type: str

class QuestionRequest(BaseModel):
    document_id: str
    question: str

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")

def extract_text_from_txt(file_content: bytes) -> str:
    try:
        return file_content.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading TXT: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "AI Document Analyzer API", "version": "1.0.0"}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    content = await file.read()
    
    file_extension = file.filename.lower().split('.')[-1]
    
    if file_extension == 'pdf':
        text = extract_text_from_pdf(content)
    elif file_extension == 'docx':
        text = extract_text_from_docx(content)
    elif file_extension == 'txt':
        text = extract_text_from_txt(content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, DOCX, or TXT files.")
    
    document_id = f"doc_{len(documents) + 1}"
    
    documents[document_id] = {
        "filename": file.filename,
        "content": text,
        "file_type": file_extension
    }
    
    return {
        "document_id": document_id,
        "filename": file.filename,
        "file_type": file_extension,
        "content_length": len(text),
        "preview": text[:500] + "..." if len(text) > 500 else text
    }

@app.post("/analyze")
async def analyze_document(request: AnalysisRequest):
    if request.document_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = documents[request.document_id]
    content = document["content"]
    
    analysis_prompts = {
        "summary": "Please provide a comprehensive summary of this document, highlighting the main points and key takeaways:",
        "key_insights": "Extract the key insights, themes, and important concepts from this document:",
        "sentiment": "Analyze the sentiment and tone of this document:",
        "entities": "Identify and extract important entities (people, places, organizations, dates) mentioned in this document:"
    }
    
    if request.analysis_type not in analysis_prompts:
        raise HTTPException(status_code=400, detail="Invalid analysis type")
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert document analyst. Provide clear, structured, and insightful analysis."},
                {"role": "user", "content": f"{analysis_prompts[request.analysis_type]}\n\nDocument content:\n{content}"}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        return {
            "document_id": request.document_id,
            "analysis_type": request.analysis_type,
            "result": response.choices[0].message.content,
            "filename": document["filename"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")

@app.post("/question")
async def ask_question(request: QuestionRequest):
    if request.document_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = documents[request.document_id]
    content = document["content"]
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided document content. If the answer cannot be found in the document, say so clearly."},
                {"role": "user", "content": f"Document content:\n{content}\n\nQuestion: {request.question}"}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        return {
            "document_id": request.document_id,
            "question": request.question,
            "answer": response.choices[0].message.content,
            "filename": document["filename"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/documents")
def list_documents():
    return {
        "documents": [
            {
                "id": doc_id,
                "filename": doc_data["filename"],
                "file_type": doc_data["file_type"],
                "content_length": len(doc_data["content"])
            }
            for doc_id, doc_data in documents.items()
        ]
    }
