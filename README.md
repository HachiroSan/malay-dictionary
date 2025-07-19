# Malay Dictionary

A Node.js library to access Malay definitions from the Dewan Bahasa dan Pustaka (DBP) website. This library allows you to search for English words and get their Malay definitions, along with related information like proverbs (peribahasa) and related services.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Local Development](#local-development)
  - [Usage in Development](#usage-in-development)
- [API Reference](#api-reference)
  - [MalayDictionary](#malaydictionary)
  - [Data Types](#data-types)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Advanced Usage](#advanced-usage)
  - [Batch Processing](#batch-processing)
- [Command Line Interface](#command-line-interface)
  - [Basic Usage](#basic-usage-1)
  - [Advanced Options](#advanced-options)
  - [CLI Options](#cli-options)
- [Error Handling](#error-handling)
- [Rate Limiting and Best Practices](#rate-limiting-and-best-practices)
- [Technical Details](#technical-details)
  - [Website Analysis](#website-analysis)
  - [Content Structure](#content-structure)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

## Features

- Search English words and get Malay definitions
- Extract structured definition data (part of speech, context, etc.)
- Get related proverbs (peribahasa) and their explanations
- Access related services and resources
- Batch search multiple words
- Configurable retry logic and rate limiting
- Error handling and validation
- TypeScript support with full type definitions

## Installation

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

// Search for a word
const result = await dictionary.search('hello');

if (result.hasResults) {
  console.log('Malay definition:', result.definitions[0].malayDefinition);
  // Output: helo
}
```

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
const result = await dictionary.search('computer', {
  includeRelated: true,
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
const result = await dictionary.search('reluctant');

if (result.hasResults) {
  const definition = result.definitions[0];
  console.log(`Word: ${definition.word}`);
  console.log(`Part of Speech: ${definition.partOfSpeech}`);
  console.log(`Definition: ${definition.malayDefinition}`);
  console.log(`Source: ${definition.source}`);
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
const result = await dictionary.search('computer', {
  includeRelated: true,
  includePeribahasa: true,
  includeTesaurus: true
});

// Process definitions
result.definitions.forEach((def, index) => {
  console.log(`\nDefinition ${index + 1}:`);
  console.log(`  Word: ${def.word}`);
  console.log(`  Part of Speech: ${def.partOfSpeech || 'N/A'}`);
  console.log(`  Context: ${def.context || 'N/A'}`);
  console.log(`  Malay Definition: ${def.malayDefinition}`);
  console.log(`  Source: ${def.source}`);
});

// Process related services
if (result.relatedServices) {
  console.log('\nRelated Services:');
  result.relatedServices.forEach(service => {
    console.log(`  ${service.name}: ${service.count} results`);
  });
}

// Process peribahasa (proverbs)
if (result.peribahasa) {
  console.log('\nPeribahasa (Proverbs):');
  result.peribahasa.forEach(peribahasa => {
    console.log(`  ${peribahasa.malayText}`);
    console.log(`  ${peribahasa.englishText}`);
    console.log(`  ${peribahasa.explanation}`);
  });
}
```

### Batch Processing

```typescript
import { MalayDictionary } from './src/index';

const dictionary = new MalayDictionary({ delay: 1000 });

const words = [
  'hello',
  'world',
  'computer',
  'internet',
  'software'
];

console.log('Searching multiple words...');
const results = await dictionary.searchMultiple(words);

// Create a simple dictionary
const dictionaryMap = new Map<string, string>();
results.forEach((result, word) => {
  if (result.hasResults) {
    dictionaryMap.set(word, result.definitions[0].malayDefinition);
  }
});

console.log('Dictionary:', Object.fromEntries(dictionaryMap));
```

## Command Line Interface

The library includes a CLI tool for quick dictionary lookups:

### Basic Usage

```bash
# Simple definition lookup (default behavior)
npx ts-node src/cli.ts hello

# Get full results including related services and proverbs
npx ts-node src/cli.ts computer --verbose

# Output in JSON format
npx ts-node src/cli.ts "hello world" --json
```

### Advanced Options

```bash
# Custom delay and timeout
npx ts-node src/cli.ts reluctant --delay 2000 --timeout 45000

# Custom retry attempts
npx ts-node src/cli.ts computer --retries 5

# Get help
npx ts-node src/cli.ts --help
```

### CLI Options

- `--word <word>` - Word to search for
- `--delay <ms>` - Delay between requests (default: 1000)
- `--timeout <ms>` - Request timeout (default: 30000)
- `--retries <number>` - Number of retries (default: 3)
- `--verbose` - Get full results including related services and proverbs
- `--json` - Output in JSON format
- `--help` - Show help message

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

## Technical Details

### Website Analysis

The DBP website uses:
- Framework: ASP.NET Web Forms
- Frontend: jQuery, Bootstrap, jQuery UI
- Content: Server-side rendered HTML
- Security: Anti-CSRF tokens
- Structure: Table-based layout with specific CSS classes

### Content Structure

Definitions are found in:
- Primary: `.tab-pane.fade.in.active` elements
- Fallback: Elements containing "Definisi :" text

Definition format:
```
Definisi : part_of_speech (context) malay_definition (Kamus Inggeris-Melayu Dewan)
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