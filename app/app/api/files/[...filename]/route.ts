
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { lookup } from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/');
    const filepath = join(process.cwd(), '..', '..', 'uploads', filename);

    const fileBuffer = await readFile(filepath);
    const mimeType = lookup(filename) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('File not found:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
