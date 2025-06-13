import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  date: string;
  model: string;
  voice: string;
  apiResponse: {
    id: string;
    model: string;
    choices: Array<{
      message: {
        content: string;
      };
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  generatedAt: string;
}

export async function GET() {
  try {
    const logsDirectory = path.join(process.cwd(), 'logs');
    const filenames = await fs.readdir(logsDirectory);
    
    const logs: LogEntry[] = [];
    
    for (const filename of filenames) {
      if (filename.endsWith('.json') && !filename.includes('archive')) {
        try {
          const filePath = path.join(logsDirectory, filename);
          const fileContents = await fs.readFile(filePath, 'utf8');
          const logData = JSON.parse(fileContents);
          logs.push(logData);
        } catch (error) {
          console.error(`Error reading log file ${filename}:`, error);
        }
      }
    }
    
    // Sort by timestamp, newest first
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json(sortedLogs);
  } catch (error) {
    console.error('Error reading logs directory:', error);
    return NextResponse.json([], { status: 500 });
  }
} 