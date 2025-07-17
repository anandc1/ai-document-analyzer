import { useState } from 'react'
import { Upload, FileText, Brain, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Document {
  document_id: string
  filename: string
  file_type: string
  content_length: number
  preview?: string
}

interface AnalysisResult {
  document_id: string
  analysis_type: string
  result: string
  filename: string
}

interface QuestionResult {
  document_id: string
  question: string
  answer: string
  filename: string
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(null)
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setUploadedDoc(result)
      setAnalysisResult(null)
      setQuestionResult(null)
    } catch (err) {
      setError('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalysis = async (analysisType: string) => {
    if (!uploadedDoc) return

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: uploadedDoc.document_id,
          analysis_type: analysisType,
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError('Failed to analyze document. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuestion = async () => {
    if (!uploadedDoc || !question.trim()) return

    setIsAsking(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: uploadedDoc.document_id,
          question: question.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Question failed')
      }

      const result = await response.json()
      setQuestionResult(result)
      setQuestion('')
    } catch (err) {
      setError('Failed to process question. Please try again.')
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Document Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your documents and let AI extract insights, generate summaries, and answer your questions
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Support for PDF, DOCX, and TXT files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Badge variant="secondary">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>

              {uploadedDoc && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Document Uploaded Successfully!</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>File:</strong> {uploadedDoc.filename}</p>
                    <p><strong>Type:</strong> {uploadedDoc.file_type.toUpperCase()}</p>
                    <p><strong>Length:</strong> {uploadedDoc.content_length} characters</p>
                  </div>
                  {uploadedDoc.preview && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-800 mb-1">Preview:</p>
                      <p className="text-xs text-green-600 bg-white p-2 rounded border">
                        {uploadedDoc.preview}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                Choose an analysis type to get AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleAnalysis('summary')}
                  disabled={!uploadedDoc || isAnalyzing}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium">Summary</div>
                    <div className="text-xs text-gray-500">Key points & takeaways</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleAnalysis('key_insights')}
                  disabled={!uploadedDoc || isAnalyzing}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium">Key Insights</div>
                    <div className="text-xs text-gray-500">Themes & concepts</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleAnalysis('sentiment')}
                  disabled={!uploadedDoc || isAnalyzing}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium">Sentiment</div>
                    <div className="text-xs text-gray-500">Tone & emotion</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleAnalysis('entities')}
                  disabled={!uploadedDoc || isAnalyzing}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium">Entities</div>
                    <div className="text-xs text-gray-500">People & places</div>
                  </div>
                </Button>
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Analyzing document...</span>
                </div>
              )}

              {analysisResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 capitalize">
                    {analysisResult.analysis_type.replace('_', ' ')} Analysis
                  </h3>
                  <div className="text-sm text-blue-700 whitespace-pre-wrap">
                    {analysisResult.result}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Question Section */}
        {uploadedDoc && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Ask Questions
              </CardTitle>
              <CardDescription>
                Ask specific questions about your document content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="What would you like to know about this document?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  onClick={handleQuestion}
                  disabled={!question.trim() || isAsking}
                  className="px-6"
                >
                  {isAsking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Ask'
                  )}
                </Button>
              </div>

              {questionResult && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Question & Answer</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Q: {questionResult.question}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 whitespace-pre-wrap">
                        <strong>A:</strong> {questionResult.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with React, FastAPI, and OpenAI GPT-4</p>
        </div>
      </div>
    </div>
  )
}

export default App
