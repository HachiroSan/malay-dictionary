# Malay Dictionary

A Node.js library to access Malay definitions from the Dewan Bahasa dan Pustaka (DBP) website. This library allows you to search for both English words and Malay words, providing comprehensive Malay definitions, along with related information like proverbs (peribahasa) and thesaurus data.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Local Development](#local-development)
  - [Usage in Development](#usage-in-development)
- [Command Line Interface](#command-line-interface)
  - [Quick Start](#quick-start)
  - [CLI Examples](#cli-examples)
  - [CLI Options](#cli-options)
- [API Reference](#api-reference)
  - [MalayDictionary](#malaydictionary)
  - [Data Types](#data-types)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [English to Malay](#english-to-malay)
  - [Malay to Malay](#malay-to-malay)
  - [Advanced Usage](#advanced-usage)
  - [Batch Processing](#batch-processing)
- [Error Handling](#error-handling)
- [Rate Limiting and Best Practices](#rate-limiting-and-best-practices)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

## Features

- **🔤 Phonetic Transcription** - Get pronunciation guides like `[ber.la.ri]`
- **📝 Jawi Script** - Access traditional Malay script like `برلاري`
- **📚 Multiple Sources** - Definitions from Kamus Dewan, Kamus Pelajar, and more
- **🌍 Bilingual Support** - Search English words for Malay definitions
- **📖 Comprehensive Definitions** - Part of speech, context, and detailed explanations
- **📜 Proverbs & Thesaurus** - Access peribahasa and related words
- **⚡ CLI Tool** - Command-line interface for quick lookups
- **🔄 Batch Processing** - Search multiple words efficiently
- **🛡️ Error Handling** - Robust error handling and retry logic
- **⚙️ Configurable** - Customizable timeouts, delays, and retries
- **📦 TypeScript** - Full TypeScript support with type definitions

## Installation

### Install as Package

```bash
# Install directly from GitHub
npm install git+https://github.com/HachiroSan/malay_dictionary.git
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/HachiroSan/malay_dictionary.git
cd malay_dictionary

# Install dependencies
npm install

# Build the project
npm run build
```

### Usage in Development

```typescript
import { MalayDictionary } from './src/index';

// Create a dictionary instance
const dictionary = new MalayDictionary({
  timeout: 30000,
  delay: 1000, // 1 second delay between requests
  retries: 3
});

// Search for a word with full details
const result = await dictionary.search('berlari', {
  includePeribahasa: true,
  includeTesaurus: true
});

if (result.hasResults) {
  const definition = result.definitions[0];
  console.log(`Word: ${definition.word}`);
  console.log(`Phonetic: [${definition.phonetic}]`);
  console.log(`Jawi: ${definition.jawi}`);
  console.log(`Definition: ${definition.malayDefinition}`);
}
```

### Usage as Installed Package

```typescript
import { MalayDictionary } from 'malay-dictionary';

// Create a dictionary instance
const dictionary = new MalayDictionary();

// Quick search
const result = await dictionary.search('makan');

if (result.hasResults) {
  console.log(`Definition: ${result.definitions[0].malayDefinition}`);
  console.log(`Phonetic: [${result.definitions[0].phonetic}]`);
  console.log(`Jawi: ${result.definitions[0].jawi}`);
}
```

## Command Line Interface

The library includes a powerful CLI tool for quick dictionary lookups with rich output:

### Quick Start

```bash
# Search for Malay words with full details
npx ts-node src/cli.ts berlari --verbose

# Search for English words
npx ts-node src/cli.ts hello

# Get JSON output for programmatic use
npx ts-node src/cli.ts makan --verbose --json
```

### CLI Examples

```bash
# Malay word with phonetic and Jawi script
npx ts-node src/cli.ts berlari --verbose
# Output includes:
# - Word: berlari
# - Phonetic: [ber.la.ri]
# - Jawi: برلاري
# - Multiple definitions from different sources
# - Thesaurus information

# English to Malay lookup
npx ts-node src/cli.ts computer --verbose

# Simple definition only
npx ts-node src/cli.ts rumah

# Custom settings
npx ts-node src/cli.ts reluctant --delay 2000 --timeout 45000 --retries 5
```

### CLI Options

- `--word <word>` - Word to search for
- `--delay <ms>` - Delay between requests (default: 1000)
- `--timeout <ms>` - Request timeout (default: 30000)
- `--retries <number>` - Number of retries (default: 3)
- `--verbose` - Get full results including multiple definitions, phonetic transcription, Jawi script, and thesaurus
- `--json` - Output in JSON format
- `--help` - Show help message

## API Reference

### MalayDictionary

The main class for interacting with the DBP website.

#### Constructor

```typescript
new MalayDictionary(options?: SearchOptions)
```

**Options:**
- `timeout?: number` - Request timeout in milliseconds (default: 30000)
- `delay?: number` - Delay between requests in milliseconds
- `retries?: number` - Number of retry attempts (default: 3)
- `userAgent?: string` - Custom user agent string
- `followRedirects?: boolean` - Whether to follow redirects (default: true)

#### Methods

##### `search(word: string, options?: SearchOptions): Promise<DBPResult>`

Search for a word and get comprehensive results.

```typescript
const result = await dictionary.search('berlari', {
  includePeribahasa: true,
  includeTesaurus: true
});
```

**Search Options:**
- `includeRelated?: boolean` - Include related services (default: false)
- `includePeribahasa?: boolean` - Include proverbs (default: false)
- `includeTesaurus?: boolean` - Include thesaurus info (default: false)

##### `getDefinition(word: string): Promise<string | null>`

Get a simple Malay definition for a word.

```typescript
const definition = await dictionary.getDefinition('hello');
console.log(definition); // "helo"
```

##### `searchMultiple(words: string[], options?: SearchOptions): Promise<Map<string, DBPResult>>`

Search for multiple words at once.

```typescript
const words = ['hello', 'world', 'computer'];
const results = await dictionary.searchMultiple(words);

results.forEach((result, word) => {
  if (result.hasResults) {
    console.log(`${word}: ${result.definitions[0].malayDefinition}`);
  }
});
```

### Data Types

#### DBPResult

```typescript
interface DBPResult {
  word: string;
  definitions: DBPDefinition[];
  relatedServices?: RelatedService[];
  peribahasa?: Peribahasa[];
  tesaurus?: string;
  hasResults: boolean;
}
```

#### DBPDefinition

```typescript
interface DBPDefinition {
  word: string;
  phonetic?: string;        // Phonetic transcription like "ber.la.ri"
  jawi?: string;           // Jawi script like "برلاري"
  partOfSpeech?: string;
  context?: string;
  malayDefinition: string;
  source: string;
  rawText: string;
}
```

#### RelatedService

```typescript
interface RelatedService {
  name: string;
  count: number;
  url: string;
}
```

#### Peribahasa

```typescript
interface Peribahasa {
  id: string;
  malayText: string;
  englishText: string;
  explanation: string;
  count: number;
}
```

## Examples

### Basic Usage

```typescript
import { MalayDictionary } from './src/index';

const dictionary = new MalayDictionary();

// Simple search
const result = await dictionary.search('berlari');

if (result.hasResults) {
  const definition = result.definitions[0];
  console.log(`Word: ${definition.word}`);
  console.log(`Phonetic: [${definition.phonetic}]`);
  console.log(`Jawi: ${definition.jawi}`);
  console.log(`Part of Speech: ${definition.partOfSpeech}`);
  console.log(`Definition: ${definition.malayDefinition}`);
  console.log(`Source: ${definition.source}`);
}
```

### English to Malay

```typescript
import { MalayDictionary } from './src/index';

const dictionary = new MalayDictionary();

// Search English words for Malay definitions
const englishWords = ['hello', 'computer', 'beautiful'];

for (const word of englishWords) {
  const result = await dictionary.search(word);
  if (result.hasResults) {
    console.log(`${word}: ${result.definitions[0].malayDefinition}`);
  }
}
```

### Malay to Malay

```typescript
import { MalayDictionary } from './src/index';

const dictionary = new MalayDictionary();

// Search Malay words for comprehensive Malay definitions
const malayWords = ['makan', 'rumah', 'cantik'];

for (const word of malayWords) {
  const result = await dictionary.search(word);
  if (result.hasResults) {
    console.log(`\n${word}:`);
    result.definitions.forEach((def, index) => {
      console.log(`  ${index + 1}. ${def.malayDefinition} (${def.source})`);
      if (def.phonetic) console.log(`     Phonetic: [${def.phonetic}]`);
      if (def.jawi) console.log(`     Jawi: ${def.jawi}`);
    });
  }
}
```

### Advanced Usage

```typescript
import { MalayDictionary } from './src/index';

const dictionary = new MalayDictionary({
  timeout: 45000,
  delay: 2000, // 2 second delay between requests
  retries: 5
});

// Search with all options enabled
const result = await dictionary.search('berlari', {
  includePeribahasa: true,
  includeTesaurus: true
});

// Process multiple definitions from different sources
result.definitions.forEach((def, index) => {
  console.log(`\nDefinition ${index + 1} (${def.source}):`);
  console.log(`  Word: ${def.word}`);
  console.log(`  Phonetic: [${def.phonetic || 'N/A'}]`);
  console.log(`  Jawi: ${def.jawi || 'N/A'}`);
  console.log(`  Part of Speech: ${def.partOfSpeech || 'N/A'}`);
  console.log(`  Context: ${def.context || 'N/A'}`);
  console.log(`  Malay Definition: ${def.malayDefinition}`);
});

// Filter definitions by source
const dewanDefinitions = result.definitions.filter(def => 
  def.source.includes('Dewan')
);
const pelajarDefinitions = result.definitions.filter(def => 
  def.source.includes('Pelajar')
);

console.log(`\nFound ${dewanDefinitions.length} Dewan definitions and ${pelajarDefinitions.length} Pelajar definitions`);

// Process peribahasa (proverbs)
if (result.peribahasa) {
  console.log('\nPeribahasa (Proverbs):');
  result.peribahasa.forEach(peribahasa => {
    console.log(`  ${peribahasa.malayText}`);
    console.log(`  ${peribahasa.englishText}`);
    console.log(`  ${peribahasa.explanation}`);
  });
}

// Process thesaurus
if (result.tesaurus) {
  console.log('\nThesaurus:');
  console.log(`  ${result.tesaurus}`);
}
```

### Batch Processing

```typescript
import { MalayDictionary } from './src/index';

const dictionary = new MalayDictionary({ delay: 1000 });

const words = [
  'hello',
  'makan',
  'computer',
  'rumah'
];

console.log('Searching multiple words...');
const results = await dictionary.searchMultiple(words);

// Create a comprehensive dictionary with all definitions
const dictionaryMap = new Map<string, Array<{definition: string, source: string, phonetic?: string, jawi?: string}>>();
results.forEach((result, word) => {
  if (result.hasResults) {
    const definitions = result.definitions.map(def => ({
      definition: def.malayDefinition,
      source: def.source,
      phonetic: def.phonetic,
      jawi: def.jawi
    }));
    dictionaryMap.set(word, definitions);
  }
});

// Display results with sources
dictionaryMap.forEach((definitions, word) => {
  console.log(`\n${word}:`);
  definitions.forEach((def, index) => {
    console.log(`  ${index + 1}. ${def.definition} (${def.source})`);
    if (def.phonetic) console.log(`     Phonetic: [${def.phonetic}]`);
    if (def.jawi) console.log(`     Jawi: ${def.jawi}`);
  });
});
```

## Error Handling

The library provides comprehensive error handling:

```typescript
import { MalayDictionary, DBPError } from './src/index';

const dictionary = new MalayDictionary();

try {
  const result = await dictionary.search('nonexistentword');
  // Handle result
} catch (error) {
  if (error instanceof DBPError) {
    console.error(`DBP Error: ${error.message}`);
    console.error(`Status Code: ${error.statusCode}`);
    console.error(`URL: ${error.url}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Rate Limiting and Best Practices

To be respectful to the DBP website:

1. Use delays between requests: Set a reasonable delay (1-2 seconds)
2. Implement retry logic: Use the built-in retry mechanism
3. Handle errors gracefully: Always wrap calls in try-catch blocks
4. Don't overwhelm the server: Avoid making too many requests simultaneously

```typescript
const dictionary = new MalayDictionary({
  delay: 2000, // 2 second delay
  retries: 3,
  timeout: 30000
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This library is for educational and research purposes. Please respect the DBP website's terms of service and use responsibly. The authors are not affiliated with Dewan Bahasa dan Pustaka. 