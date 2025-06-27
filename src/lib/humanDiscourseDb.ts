import { promises as fs } from 'fs';
import path from 'path';

interface HumanDiscourseMapping {
  id: string;
  timestamp: string;
  anonymousId: string;
  realIdentifier: string;
  threadId: string;
  accessApplicationId?: string;
}

const MAPPINGS_DIR = path.join(process.cwd(), 'logs', 'human-discourse-mappings');

// Ensure the mappings directory exists
async function ensureMappingsDir(): Promise<void> {
  try {
    await fs.mkdir(MAPPINGS_DIR, { recursive: true });
  } catch (error) {
    console.log('Mappings directory setup:', error);
  }
}

// Store a human discourse mapping (ADMIN USE ONLY)
export async function storeHumanDiscourseMapping(
  anonymousId: string,
  realIdentifier: string,
  threadId: string,
  accessApplicationId?: string
): Promise<string> {
  await ensureMappingsDir();
  
  const id = `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const mapping: HumanDiscourseMapping = {
    id,
    timestamp,
    anonymousId,
    realIdentifier,
    threadId,
    accessApplicationId,
  };
  
  const filename = `${timestamp.split('T')[0]}-${id}.json`;
  const filepath = path.join(MAPPINGS_DIR, filename);
  
  try {
    await fs.writeFile(filepath, JSON.stringify(mapping, null, 2));
    console.log(`Human discourse mapping stored: ${filename}`);
    return id;
  } catch (error) {
    console.error('Error storing human discourse mapping:', error);
    throw error;
  }
}

// Retrieve mapping by anonymous ID (ADMIN USE ONLY)
export async function getMappingByAnonymousId(anonymousId: string): Promise<HumanDiscourseMapping | null> {
  await ensureMappingsDir();
  
  try {
    const files = await fs.readdir(MAPPINGS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(MAPPINGS_DIR, file);
        const content = await fs.readFile(filepath, 'utf-8');
        const mapping = JSON.parse(content) as HumanDiscourseMapping;
        
        if (mapping.anonymousId === anonymousId) {
          return mapping;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving mapping by anonymous ID:', error);
    return null;
  }
}

// Get all mappings (ADMIN USE ONLY)
export async function getAllHumanDiscourseMappings(): Promise<HumanDiscourseMapping[]> {
  await ensureMappingsDir();
  
  try {
    const files = await fs.readdir(MAPPINGS_DIR);
    const mappings: HumanDiscourseMapping[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(MAPPINGS_DIR, file);
        const content = await fs.readFile(filepath, 'utf-8');
        mappings.push(JSON.parse(content) as HumanDiscourseMapping);
      }
    }
    
    return mappings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error retrieving all mappings:', error);
    return [];
  }
}

export type { HumanDiscourseMapping }; 