
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UploadSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [perspective, setPerspective] = useState<'buyer' | 'supplier'>('buyer');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('perspective', perspective);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Analysis is automatically started by the upload API
      // Navigate to the analysis page to view progress
      router.push(`/analysis/${result.reportId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-12 shadow-xl">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Perspective Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Analysis Perspective</Label>
            <RadioGroup
              value={perspective}
              onValueChange={(value) => setPerspective(value as 'buyer' | 'supplier')}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buyer" id="buyer" />
                <Label htmlFor="buyer" className="font-normal">
                  Buyer Perspective
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supplier" id="supplier" />
                <Label htmlFor="supplier" className="font-normal">
                  Supplier Perspective
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-gray-500">
              {perspective === 'buyer' 
                ? 'Analyze risks from a buyer evaluating supplier proposals'
                : 'Analyze risks from a supplier preparing their response'
              }
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Upload RFP Document</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-indigo-400 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-indigo-600">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop your file here' : 'Drop your RFP document here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse • PDF, DOC, DOCX • Max 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              'Start Risk Analysis'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your document will be analyzed using advanced AI models against 831 risk mitigation strategies
            from MIT taxonomy and regulatory frameworks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
