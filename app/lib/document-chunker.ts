
// Enhanced document chunking utility for handling large documents
export interface DocumentChunk {
  content: string;
  index: number;
  totalChunks: number;
  characterCount: number;
  isLast: boolean;
}

export interface ChunkingOptions {
  maxChunkSize: number;
  overlapSize: number;
  preserveSentences: boolean;
}

const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  maxChunkSize: 6000, // Reduced from 8000 for better processing
  overlapSize: 200,
  preserveSentences: true
};

export function chunkDocument(
  content: string, 
  options: Partial<ChunkingOptions> = {}
): DocumentChunk[] {
  const opts = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
  
  // If content is small enough, return as single chunk
  if (content.length <= opts.maxChunkSize) {
    return [{
      content,
      index: 0,
      totalChunks: 1,
      characterCount: content.length,
      isLast: true
    }];
  }

  const chunks: DocumentChunk[] = [];
  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < content.length) {
    let chunkEnd = Math.min(currentPosition + opts.maxChunkSize, content.length);
    
    // Try to break at sentence boundaries if preserveSentences is enabled
    if (opts.preserveSentences && chunkEnd < content.length) {
      const sentenceBreaks = ['. ', '! ', '? ', '\n\n'];
      let bestBreak = -1;
      
      for (const breakChar of sentenceBreaks) {
        const lastBreak = content.lastIndexOf(breakChar, chunkEnd);
        if (lastBreak > currentPosition + opts.maxChunkSize * 0.7) {
          bestBreak = Math.max(bestBreak, lastBreak + breakChar.length);
        }
      }
      
      if (bestBreak > -1) {
        chunkEnd = bestBreak;
      }
    }

    const chunkContent = content.substring(currentPosition, chunkEnd);
    
    chunks.push({
      content: chunkContent,
      index: chunkIndex,
      totalChunks: 0, // Will be updated after all chunks are created
      characterCount: chunkContent.length,
      isLast: false // Will be updated for the last chunk
    });

    // Move position forward, accounting for overlap
    currentPosition = chunkEnd - (chunkIndex > 0 ? opts.overlapSize : 0);
    chunkIndex++;
  }

  // Update totalChunks and mark last chunk
  chunks.forEach((chunk, index) => {
    chunk.totalChunks = chunks.length;
    chunk.isLast = index === chunks.length - 1;
  });

  return chunks;
}

export function shouldUseChunking(content: string, fileType: string): boolean {
  const CHUNKING_THRESHOLD = 8000; // Characters
  
  // Always chunk very large documents
  if (content.length > CHUNKING_THRESHOLD) {
    return true;
  }
  
  // Chunk PDFs more aggressively as they tend to be more complex
  if (fileType.includes('pdf') && content.length > 6000) {
    return true;
  }
  
  return false;
}

export function estimateProcessingTime(chunks: DocumentChunk[]): number {
  // Base time per chunk in seconds
  const baseTimePerChunk = 30;
  const additionalTimePerChunk = 15;
  
  return baseTimePerChunk + (chunks.length - 1) * additionalTimePerChunk;
}

export function processDocument(content: string, fileType: string): { 
  chunks: DocumentChunk[], 
  shouldChunk: boolean,
  estimatedTime: number 
} {
  const shouldChunk = shouldUseChunking(content, fileType);
  const chunks = shouldChunk ? chunkDocument(content) : [{
    content,
    index: 0,
    totalChunks: 1,
    characterCount: content.length,
    isLast: true
  }];
  
  return {
    chunks,
    shouldChunk,
    estimatedTime: estimateProcessingTime(chunks)
  };
}
