import { CommandProcessor } from '../src/lib/commandProcessor';
import { PersonaType } from '../src/types/threading';

// List of all personas/voices
const personas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];

async function testAllVoicesHello() {
  const processor = new CommandProcessor();
  const results: Record<string, any> = {};

  for (const persona of personas) {
    try {
      // Use a simple prompt for each persona
      const prompt = await processor['loadPersonaPrompt'](persona);
      const context = `Say hello in your own style.`;
      const response = await processor['generateAIContent'](prompt, context, persona);
      results[persona] = response;
      console.log(`\n---\n${persona.toUpperCase()} says: ${response}\n---`);
    } catch (error) {
      results[persona] = { error: error instanceof Error ? error.message : error };
      console.error(`Error for ${persona}:`, error);
    }
  }

  // Optionally, print the raw results for type inspection
  console.log('\nRaw results:', JSON.stringify(results, null, 2));
}

testAllVoicesHello(); 