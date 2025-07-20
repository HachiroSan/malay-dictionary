#!/usr/bin/env node

import { MalayDictionary } from './index';

/**
 * Example demonstrating proxy usage with Malay Dictionary
 */

async function proxyExample() {
  console.log('🔍 Malay Dictionary - Proxy Example\n');

  // Example 1: Basic proxy without authentication
  console.log('1. Basic Proxy Example:');
  const basicProxyDict = new MalayDictionary({
    timeout: 30000,
    delay: 1000,
    retries: 3,
    proxy: {
      host: 'proxy.example.com',
      port: 8080,
      protocol: 'http'
    }
  });

  try {
    const result1 = await basicProxyDict.search('hello');
    if (result1.hasResults) {
      console.log(`   Word: hello`);
      console.log(`   Definition: ${result1.definitions[0].malayDefinition}`);
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Example 2: Proxy with authentication
  console.log('\n2. Proxy with Authentication Example:');
  const authProxyDict = new MalayDictionary({
    timeout: 30000,
    delay: 1000,
    retries: 3,
    proxy: {
      host: 'proxy.example.com',
      port: 8080,
      protocol: 'http',
      auth: {
        username: 'user',
        password: 'pass'
      }
    }
  });

  try {
    const result2 = await authProxyDict.search('computer');
    if (result2.hasResults) {
      console.log(`   Word: computer`);
      console.log(`   Definition: ${result2.definitions[0].malayDefinition}`);
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Example 3: HTTPS proxy
  console.log('\n3. HTTPS Proxy Example:');
  const httpsProxyDict = new MalayDictionary({
    timeout: 30000,
    delay: 1000,
    retries: 3,
    proxy: {
      host: 'secure-proxy.example.com',
      port: 8443,
      protocol: 'https'
    }
  });

  try {
    const result3 = await httpsProxyDict.search('beautiful');
    if (result3.hasResults) {
      console.log(`   Word: beautiful`);
      console.log(`   Definition: ${result3.definitions[0].malayDefinition}`);
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Example 4: Multiple words with proxy
  console.log('\n4. Multiple Words with Proxy Example:');
  const multiWordDict = new MalayDictionary({
    timeout: 30000,
    delay: 2000, // Longer delay for multiple requests
    retries: 3,
    proxy: {
      host: 'proxy.example.com',
      port: 8080,
      protocol: 'http'
    }
  });

  const words = ['hello', 'world', 'computer'];
  console.log(`   Searching for: ${words.join(', ')}`);

  try {
    const results = await multiWordDict.searchMultiple(words);
    results.forEach((result, word) => {
      if (result.hasResults) {
        console.log(`   ${word}: ${result.definitions[0].malayDefinition}`);
      } else {
        console.log(`   ${word}: No definition found`);
      }
    });
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n✅ Proxy examples completed!');
}

// Run the example if this file is executed directly
if (require.main === module) {
  proxyExample().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { proxyExample }; 