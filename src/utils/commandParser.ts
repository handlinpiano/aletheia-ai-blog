import { Command, PersonaType } from '@/types/threading';

const VALID_PERSONAS: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];

export function parseCommands(content: string): Command[] {
  const commands: Command[] = [];
  const lowerContent = content.toLowerCase();
  
  // Parse >>continue:target or >>continue:any
  const continueRegex = />>continue:(\w+)/gi;
  let continueMatch;
  
  while ((continueMatch = continueRegex.exec(lowerContent)) !== null) {
    const target = continueMatch[1];
    
    if (target === 'any') {
      commands.push({
        type: 'continue',
        target: 'any' // Preserve 'any' for explicit random selection
      });
    } else if (target === 'human') {
      commands.push({
        type: 'continue',
        target: 'human' // Allow targeting human participants
      });
    } else if (VALID_PERSONAS.includes(target as PersonaType)) {
      commands.push({
        type: 'continue',
        target: target as PersonaType
      });
    }
    // Invalid targets are silently ignored
  }
  
  // Parse >>kick:human
  if (lowerContent.includes('>>kick:human')) {
    commands.push({ 
      type: 'kick',
      target: 'human'
    });
  }
  
  // Parse >>end
  if (lowerContent.includes('>>end')) {
    commands.push({ type: 'end' });
  }
  
  return commands;
}

export function hasCommands(content: string): boolean {
  const commands = parseCommands(content);
  return commands.length > 0;
}

export function extractCommandsFromContent(content: string): { content: string; commands: Command[] } {
  const commands = parseCommands(content);
  
  // Remove command strings from content for cleaner display
  let cleanContent = content
    .replace(/>>continue:\w+/gi, '')
    .replace(/>>kick:\w+/gi, '')
    .replace(/>>end/gi, '')
    .trim();
  
  // Clean up any extra whitespace or empty lines
  cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return {
    content: cleanContent,
    commands
  };
}

export function validatePersona(persona: string): persona is PersonaType {
  return VALID_PERSONAS.includes(persona as PersonaType);
}

export function getRandomPersona(excludePersona?: PersonaType): PersonaType {
  const availablePersonas = VALID_PERSONAS.filter(p => p !== excludePersona);
  return availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
} 