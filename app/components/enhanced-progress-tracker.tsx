
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Brain, 
  Database, 
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ProgressUpdate {
  step: string;
  message: string;
  progress: number;
  timestamp: string;
  phase: string;
  estimatedTimeRemaining?: string;
  details?: string[];
  error?: boolean;
}

interface EnhancedProgressTrackerProps {
  reportId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const PHASE_ICONS = {
  'Document Validation': FileText,
  'File Type Detection': FileText,
  'Content Extraction': FileText,
  'Document Analysis': FileText,
  'Risk Context Loading': Shield,
  'AI Risk Assessment': Brain,
  'Result Processing': Database,
  'Database Storage': Database,
  'Final Report Generation': CheckCircle,
  'Error': AlertTriangle
};

export function EnhancedProgressTracker({ reportId, onComplete, onError }: EnhancedProgressTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('Initializing');
  const [currentMessage, setCurrentMessage] = useState('Starting analysis...');
  const [estimatedTime, setEstimatedTime] = useState('Calculating...');
  const [progressHistory, setProgressHistory] = useState<ProgressUpdate[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showDetailedLog, setShowDetailedLog] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // This component will be used when analysis is already in progress
    // The parent component will handle the actual streaming
    // This is just a display component for the progress
    let intervalId: NodeJS.Timeout;

    // Check analysis status periodically
    const checkAnalysisStatus = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.report.status === 'completed') {
            setIsCompleted(true);
            setProgress(100);
            setCurrentPhase('Analysis Complete');
            setCurrentMessage('Risk assessment completed successfully!');
            onComplete?.();
          } else if (data.report.status === 'failed') {
            setHasError(true);
            setCurrentMessage('Analysis failed');
            onError?.('Analysis failed - please try again');
          }
        }
      } catch (error) {
        console.error('Error checking analysis status:', error);
      }
    };

    intervalId = setInterval(checkAnalysisStatus, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [reportId, onComplete, onError]);

  // Method to receive progress updates from parent component
  const updateProgress = (update: ProgressUpdate) => {
    setProgress(update.progress);
    setCurrentPhase(update.phase);
    setCurrentMessage(update.message);
    if (update.estimatedTimeRemaining) {
      setEstimatedTime(update.estimatedTimeRemaining);
    }
    
    setProgressHistory(prev => [...prev, update]);

    if (update.error) {
      setHasError(true);
      onError?.(update.message);
    } else if (update.progress >= 100) {
      setIsCompleted(true);
      onComplete?.();
    }
  };

  const getPhaseIcon = (phase: string) => {
    const IconComponent = PHASE_ICONS[phase as keyof typeof PHASE_ICONS] || Loader2;
    return IconComponent;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const elapsed = Math.round((date.getTime() - startTime) / 1000);
    return `${elapsed}s`;
  };

  const getProgressColor = () => {
    if (hasError) return 'bg-red-500';
    if (isCompleted) return 'bg-green-500';
    return 'bg-indigo-600';
  };

  if (hasError) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <span>Analysis Failed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">{currentMessage}</p>
            {progressHistory.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                <div className="space-y-2">
                  {progressHistory.slice(-1).map((update, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <div className="font-medium">{update.message}</div>
                      {update.details && update.details.length > 0 && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {update.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="text-red-600">• {detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            )}
            <span>{isCompleted ? 'Analysis Complete' : 'AI Risk Analysis'}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Report ID: {reportId.slice(-8)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {React.createElement(getPhaseIcon(currentPhase), {
                className: `h-5 w-5 ${isCompleted ? 'text-green-600' : hasError ? 'text-red-600' : 'text-indigo-600'}`
              })}
              <span className="font-medium text-gray-900">{currentPhase}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{estimatedTime}</span>
              </div>
              <span className="font-medium">{progress}%</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-gray-700 font-medium">{currentMessage}</p>
        </div>

        {/* Current Details */}
        {progressHistory.length > 0 && progressHistory[progressHistory.length - 1].details && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Current Operations:</span>
            </h4>
            <ul className="space-y-1">
              {progressHistory[progressHistory.length - 1].details?.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Log */}
        <Collapsible open={showDetailedLog} onOpenChange={setShowDetailedLog}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Detailed Progress Log ({progressHistory.length} steps)</span>
              </span>
              {showDetailedLog ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-4">
            <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {progressHistory.map((update, index) => (
                  <div key={index} className="border-l-2 border-indigo-200 pl-4 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {React.createElement(getPhaseIcon(update.phase), {
                          className: `h-4 w-4 ${update.error ? 'text-red-500' : 'text-indigo-500'}`
                        })}
                        <span className="font-medium text-sm text-gray-900">{update.phase}</span>
                        <Badge variant="outline" className="text-xs">
                          {update.progress}%
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>+{formatTimestamp(update.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{update.message}</p>
                    {update.details && update.details.length > 0 && (
                      <ul className="space-y-1">
                        {update.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-xs text-gray-600 flex items-start space-x-2">
                            <span className="text-indigo-400 mt-0.5">→</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Analysis Statistics */}
        {progressHistory.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{progressHistory.length}</div>
              <div className="text-xs text-indigo-800">Processing Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round((Date.now() - startTime) / 1000)}s
              </div>
              <div className="text-xs text-indigo-800">Elapsed Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{progress}%</div>
              <div className="text-xs text-indigo-800">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {new Set(progressHistory.map(h => h.phase)).size}
              </div>
              <div className="text-xs text-indigo-800">Phases Complete</div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="text-center py-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analysis Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              Your comprehensive AI risk assessment is ready for review.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              View Results
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
