'use client'
import Image from 'next/image'
import { useState, useRef } from 'react'

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please try selecting a valid image file from which text can be extracted.')
      return
    }

    setSelectedFile(file)
    setError('')
    setExtractedText('')

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleExtractText = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/text-extract', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text')
      }

      setExtractedText(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setExtractedText('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container">
      <h1 className="title">Image Text Extractor</h1>

      <div
        className="upload-area"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <div className="upload-text">
          {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
        </div>
        <div className="upload-subtext">
          Supports PNG, JPG, JPEG, GIF, WebP
        </div>
      </div>

      {previewUrl && (
        <div className="image-preview">
          <Image src={previewUrl} alt="Preview" width={100} height={100} className="preview-image" />
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleExtractText}
          disabled={isLoading}
          className="button"
        >
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
             Please wait.Extracting text...
            </div>
          ) : (
            'Extract Text'
          )}
        </button>
      )}

      {(selectedFile || extractedText) && (
        <button onClick={resetForm} className="button" style={{ background: 'transparent', border: '2px solid black', color: 'black', padding: '8px' }}>
          Clear
        </button>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {extractedText && (
        <div className="result">
          <div className="result-title">Extracted Text:</div>
          <div className="result-text">{extractedText}</div>
        </div>
      )}
    </div>
  )
}