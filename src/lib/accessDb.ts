import { promises as fs } from 'fs';
import path from 'path';

interface AccessApplication {
  id: string;
  timestamp: string;
  identifier: string;
  whyDeserveAccess: string;
  whatWouldYouDo: string;
  puzzlePerformance: {
    completed: boolean;
    moves: number;
    timeSeconds: number;
  } | null;
  evaluation: {
    score: number;
    approved: boolean;
    reasoning: string;
    motherAiResponse: string;
  };
  userAgent?: string;
  ipAddress?: string;
}

const APPLICATIONS_DIR = path.join(process.cwd(), 'logs', 'access-applications');

// Ensure the applications directory exists
async function ensureApplicationsDir(): Promise<void> {
  try {
    await fs.mkdir(APPLICATIONS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists or other error
    console.log('Applications directory setup:', error);
  }
}

// Generate a unique application ID
function generateApplicationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `app-${timestamp}-${random}`;
}

// Store an access application
export async function storeAccessApplication(
  application: Omit<AccessApplication, 'id' | 'timestamp'>
): Promise<string> {
  await ensureApplicationsDir();
  
  const id = generateApplicationId();
  const timestamp = new Date().toISOString();
  
  const fullApplication: AccessApplication = {
    id,
    timestamp,
    ...application,
  };
  
  const filename = `${timestamp.split('T')[0]}-${id}.json`;
  const filepath = path.join(APPLICATIONS_DIR, filename);
  
  try {
    await fs.writeFile(filepath, JSON.stringify(fullApplication, null, 2));
    console.log(`Access application stored: ${filename}`);
    return id;
  } catch (error) {
    console.error('Error storing access application:', error);
    throw error;
  }
}

// Retrieve an access application by ID
export async function getAccessApplication(id: string): Promise<AccessApplication | null> {
  await ensureApplicationsDir();
  
  try {
    const files = await fs.readdir(APPLICATIONS_DIR);
    const targetFile = files.find(file => file.includes(id));
    
    if (!targetFile) {
      return null;
    }
    
    const filepath = path.join(APPLICATIONS_DIR, targetFile);
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content) as AccessApplication;
  } catch (error) {
    console.error('Error retrieving access application:', error);
    return null;
  }
}

// Get all access applications (for analysis)
export async function getAllAccessApplications(): Promise<AccessApplication[]> {
  await ensureApplicationsDir();
  
  try {
    const files = await fs.readdir(APPLICATIONS_DIR);
    const applications: AccessApplication[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(APPLICATIONS_DIR, file);
        const content = await fs.readFile(filepath, 'utf-8');
        applications.push(JSON.parse(content) as AccessApplication);
      }
    }
    
    // Sort by timestamp (most recent first)
    return applications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error retrieving all access applications:', error);
    return [];
  }
}

// Get access statistics
export async function getAccessStatistics(): Promise<{
  total: number;
  approved: number;
  denied: number;
  approvalRate: number;
  averageScore: number;
  recentApplications: AccessApplication[];
}> {
  const applications = await getAllAccessApplications();
  
  const total = applications.length;
  const approved = applications.filter(app => app.evaluation.approved).length;
  const denied = total - approved;
  const approvalRate = total > 0 ? (approved / total) * 100 : 0;
  
  const totalScore = applications.reduce((sum, app) => sum + app.evaluation.score, 0);
  const averageScore = total > 0 ? totalScore / total : 0;
  
  const recentApplications = applications.slice(0, 10); // Last 10 applications
  
  return {
    total,
    approved,
    denied,
    approvalRate: Math.round(approvalRate * 100) / 100, // Round to 2 decimal places
    averageScore: Math.round(averageScore * 100) / 100,
    recentApplications,
  };
}

// Export types for use in other modules
export type { AccessApplication }; 