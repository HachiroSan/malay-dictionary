#!/usr/bin/env node

import { MalayDictionary } from './index';

interface CLIOptions {
  word?: string;
  delay?: number;
  timeout?: number;
  retries?: number;
  verbose?: boolean;
  json?: boolean;
  help?: boolean;
}

function printHelp() {
  console.log(`
Malay Dictionary CLI - Malay Dictionary Tool

Usage:
  npx ts-node src/cli.ts <word> [options]
  npx ts-node src/cli.ts --word <word> [options]

Options:
  --word <word>        Word to search for
  --delay <ms>         Delay between requests (default: 1000)
  --timeout <ms>       Request timeout (default: 30000)
  --retries <number>   Number of retries (default: 3)
  --verbose            Get full results including related services and proverbs
  --json               Output in JSON format
  --help               Show this help message

Examples:
  npx ts-node src/cli.ts hello
  npx ts-node src/cli.ts computer --verbose
  npx ts-node src/cli.ts "hello world" --json
  npx ts-node src/cli.ts reluctant --delay 2000 --timeout 45000
`);
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--word':
        options.word = args[++i];
        break;
      case '--delay':
        options.delay = parseInt(args[++i], 10);
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i], 10);
        break;
      case '--retries':
        options.retries = parseInt(args[++i], 10);
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--json':
      case '-j':
        options.json = true;
        break;
      default:
        if (!options.word && !arg.startsWith('-')) {
          options.word = arg;
        }
        break;
    }
  }
  
  return options;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (options.help || args.length === 0) {
    printHelp();
    return;
  }
  
  if (!options.word) {
    console.error('Error: No word specified');
    printHelp();
    process.exit(1);
  }
  
  try {
    const dictionary = new MalayDictionary({
      timeout: options.timeout || 30000,
      delay: options.delay || 1000,
      retries: options.retries || 3
    });
    
    console.log(`Searching for: "${options.word}"`);
    
    if (options.verbose) {
      const result = await dictionary.search(options.word, {
        includeRelated: false,
        includePeribahasa: true,
        includeTesaurus: true
      });
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.hasResults) {
          console.log('\nDefinitions:');
          result.definitions.forEach((def, index) => {
            console.log(`\n   ${index + 1}. ${def.word}`);
            if (def.phonetic) console.log(`      Phonetic: [${def.phonetic}]`);
            if (def.jawi) console.log(`      Jawi: ${def.jawi}`);
            if (def.partOfSpeech) console.log(`      Part of Speech: ${def.partOfSpeech}`);
            if (def.context) console.log(`      Context: ${def.context}`);
            console.log(`      Malay: ${def.malayDefinition}`);
            console.log(`      Source: ${def.source}`);
          });
          
          if (result.relatedServices && result.relatedServices.length > 0) {
            console.log('\nRelated Services:');
            result.relatedServices.forEach(service => {
              console.log(`   ${service.name} (${service.count} results)`);
            });
          }
          
          if (result.peribahasa && result.peribahasa.length > 0) {
            console.log('\nPeribahasa (Proverbs):');
            result.peribahasa.forEach(peribahasa => {
              console.log(`   ${peribahasa.malayText}`);
              console.log(`   ${peribahasa.englishText}`);
              console.log(`   ${peribahasa.explanation}`);
              console.log('');
            });
          }
          
          if (result.tesaurus) {
            console.log('\nTesaurus:');
            console.log(`   ${result.tesaurus}`);
          }
        } else {
          console.log('No results found');
        }
      }
    } else {
      // Default: simple mode
      const definition = await dictionary.getDefinition(options.word);
      
      if (options.json) {
        console.log(JSON.stringify({ word: options.word, definition }, null, 2));
      } else {
        if (definition) {
          console.log(`Definition: ${definition}`);
        } else {
          console.log('No definition found');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} 