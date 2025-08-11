
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const perspective = formData.get('perspective') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!perspective || !['buyer', 'supplier'].includes(perspective)) {
      return NextResponse.json({ error: 'Invalid perspective' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream' // Sometimes DOCX files are detected as this
    ];

    // Additional validation based on file extension for octet-stream files
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['pdf', 'doc', 'docx'];

    console.log('File upload attempt:', {
      fileName: file.name,
      fileType: file.type,
      fileExtension: fileExtension,
      fileSize: file.size
    });

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type: ${file.type}. Allowed types: PDF, DOC, DOCX` 
      }, { status: 400 });
    }

    // Extra validation for octet-stream files - check extension
    if (file.type === 'application/octet-stream' && !allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json({ 
        error: `Invalid file extension: .${fileExtension}. Allowed extensions: .pdf, .doc, .docx` 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(process.cwd(), '..', 'uploads', filename);

    // Save file to uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create report record in database
    const report = await prisma.report.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        perspective: perspective,
        status: 'processing'
      }
    });

    // Start analysis in background
    startAnalysis(report.id, filepath, file.type, perspective);

    return NextResponse.json({ 
      reportId: report.id,
      message: 'File uploaded successfully. Analysis started.' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        return NextResponse.json({ error: 'Upload directory not found' }, { status: 500 });
      } else if (error.message.includes('EACCES')) {
        return NextResponse.json({ error: 'Permission denied writing file' }, { status: 500 });
      } else if (error.message.includes('ENOSPC')) {
        return NextResponse.json({ error: 'Not enough disk space' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined 
    }, { status: 500 });
  }
}

async function startAnalysis(reportId: string, filepath: string, fileType: string, perspective: string) {
  try {
    console.log('Starting streaming analysis for report:', reportId);
    
    // Start the streaming analysis process - use localhost for internal calls
    const response = await fetch(`http://localhost:3000/api/analyze-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId,
        filepath,
        fileType,
        perspective
      })
    });

    if (!response.ok) {
      throw new Error(`Analysis failed to start: ${response.statusText}`);
    }

    // Don't wait for the stream to complete - let it run in background
    console.log('Streaming analysis started successfully for report:', reportId);
    
  } catch (error) {
    console.error('Failed to start analysis:', error);
    // Update report status to failed
    await prisma.report.update({
      where: { id: reportId },
      data: { 
        status: 'failed',
        summary: `Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });
  }
}
