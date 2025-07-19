import * as cheerio from 'cheerio';
import { HttpClient } from './utils/http-client';
import { 
  DBPResult, 
  DBPDefinition, 
  RelatedService, 
  Peribahasa, 
  SearchOptions,
  DBPError 
} from './types';

export class MalayDictionary {
  private httpClient: HttpClient;
  private baseUrl = 'https://prpm.dbp.gov.my';

  constructor(options: SearchOptions = {}) {
    this.httpClient = new HttpClient(options);
  }

  /**
   * Search for a word and get its Malay definition
   * @param word - The English word to search for
   * @param options - Search options
   * @returns Promise<DBPResult>
   */
  async search(word: string, options: SearchOptions = {}): Promise<DBPResult> {
    if (!word || word.trim().length === 0) {
      throw new DBPError('Word cannot be empty');
    }

    const searchUrl = `${this.baseUrl}/Cari1?keyword=${encodeURIComponent(word.trim())}`;
    
    try {
      // Set referer to the same URL to mimic browser behavior
      this.httpClient.setReferer(searchUrl);
      
      const response = await this.httpClient.get(searchUrl);
      const $ = cheerio.load(response.data);
      
      return this.parseSearchResults($, word, options);
    } catch (error) {
      if (error instanceof DBPError) {
        throw error;
      }
      throw new DBPError(`Failed to search for word "${word}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse the search results from the HTML
   */
  private parseSearchResults($: cheerio.CheerioAPI, word: string, options: SearchOptions): DBPResult {
    const result: DBPResult = {
      word,
      definitions: [],
      hasResults: false
    };

    // Extract definitions
    const definitions = this.extractDefinitions($);
    result.definitions = definitions;
    result.hasResults = definitions.length > 0;

    // Extract related services if requested
    if (options.includeRelated === true) {
      result.relatedServices = this.extractRelatedServices($);
    }

    // Extract peribahasa if requested
    if (options.includePeribahasa === true) {
      result.peribahasa = this.extractPeribahasa($);
    }

    // Extract tesaurus if requested
    if (options.includeTesaurus === true) {
      result.tesaurus = this.extractTesaurus($);
    }

    return result;
  }

  /**
   * Extract definitions from the HTML
   */
  private extractDefinitions($: cheerio.CheerioAPI): DBPDefinition[] {
    const definitions: DBPDefinition[] = [];

    // Look for all definition tabs, not just the active one
    $('.tab-pane.fade').each((_, element) => {
      const $element = $(element);
      const definitionText = $element.text().trim();
      
      if (definitionText && definitionText.includes('Definisi :')) {
        const definition = this.parseDefinitionText(definitionText);
        if (definition) {
          definitions.push(definition);
        }
      }
    });

    // Also check the active tab
    $('.tab-pane.fade.in.active').each((_, element) => {
      const $element = $(element);
      const definitionText = $element.text().trim();
      
      if (definitionText && definitionText.includes('Definisi :')) {
        const definition = this.parseDefinitionText(definitionText);
        if (definition) {
          // Check if this definition is already captured to avoid duplicates
          const isDuplicate = definitions.some(existingDef => 
            existingDef.malayDefinition === definition.malayDefinition &&
            existingDef.source === definition.source
          );
          
          if (!isDuplicate) {
            definitions.push(definition);
          }
        }
      }
    });

    // Fallback: look for definitions in other common patterns
    if (definitions.length === 0) {
      $('b:contains("Definisi :")').each((_, element) => {
        const $element = $(element);
        const $parent = $element.parent();
        const definitionText = $parent.text().trim();
        
        if (definitionText) {
          const definition = this.parseDefinitionText(definitionText);
          if (definition) {
            definitions.push(definition);
          }
        }
      });
    }

    return definitions;
  }

  /**
   * Parse definition text to extract structured information
   */
  private parseDefinitionText(text: string): DBPDefinition | null {
    // Remove extra whitespace and normalize
    text = text.replace(/\s+/g, ' ').trim();
    
    // Extract the word from the URL or context
    const wordMatch = text.match(/([a-zA-Z]+)/);
    const word = wordMatch ? wordMatch[1] : '';
    
    // Look for the definition pattern
    const definitionMatch = text.match(/Definisi\s*:\s*(.*?)(?=\s*\(Kamus|$)/i);
    if (!definitionMatch) {
      return null;
    }

    let definitionPart = definitionMatch[1].trim();
    
    // Extract part of speech
    let partOfSpeech: string | undefined;
    const posMatch = definitionPart.match(/^([a-z]+)\s+(\(.*?\))?/i);
    if (posMatch) {
      partOfSpeech = posMatch[1];
      definitionPart = definitionPart.substring(posMatch[0].length).trim();
    }

    // Extract context (text in parentheses)
    let context: string | undefined;
    const contextMatch = definitionPart.match(/\((.*?)\)/);
    if (contextMatch) {
      context = contextMatch[1];
      definitionPart = definitionPart.replace(/\(.*?\)/, '').trim();
    }

    // Extract Malay definition (text after context, before source)
    let malayDefinition = definitionPart;
    const sourceMatch = malayDefinition.match(/(.*?)\s*\(Kamus.*$/);
    if (sourceMatch) {
      malayDefinition = sourceMatch[1].trim();
    }

    // Extract source
    const sourceMatch2 = text.match(/\((Kamus.*?)\)/);
    const source = sourceMatch2 ? sourceMatch2[1] : 'Kamus Inggeris-Melayu Dewan';

    return {
      word,
      partOfSpeech,
      context,
      malayDefinition,
      source,
      rawText: text
    };
  }

  /**
   * Extract related services from the HTML
   */
  private extractRelatedServices($: cheerio.CheerioAPI): RelatedService[] {
    const services: RelatedService[] = [];

    $('.panel-body a[href*="Cari1.aspx"]').each((_, element) => {
      const $element = $(element);
      const href = $element.attr('href');
      const text = $element.text().trim();
      const countMatch = $element.next('i').text().match(/\((\d+)\)/);
      
      if (href && text) {
        services.push({
          name: text,
          count: countMatch ? parseInt(countMatch[1], 10) : 0,
          url: href.startsWith('http') ? href : `${this.baseUrl}/${href}`
        });
      }
    });

    return services;
  }

  /**
   * Extract peribahasa (proverbs) from the HTML
   */
  private extractPeribahasa($: cheerio.CheerioAPI): Peribahasa[] {
    const peribahasa: Peribahasa[] = [];

    $('.infoPeribahasa').each((_, element) => {
      const $element = $(element);
      const $rows = $element.find('tr');
      
      if ($rows.length >= 4) {
        const id = $rows.eq(1).find('td').text().trim();
        const malayText = $rows.eq(2).find('td').text().trim();
        const englishText = $rows.eq(3).find('td').text().trim();
        const explanation = $rows.eq(4).find('td').text().trim();
        
        // Extract count from the link
        const countMatch = $element.find('a[href*="Cari1.aspx"]').last().text().match(/\((\d+)\)/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 0;

        if (id && malayText) {
          peribahasa.push({
            id,
            malayText,
            englishText,
            explanation,
            count
          });
        }
      }
    });

    return peribahasa;
  }

  /**
   * Extract tesaurus information from the HTML
   */
  private extractTesaurus($: cheerio.CheerioAPI): string | undefined {
    const tesaurusText = $('.info:contains("Tesaurus")').text().trim();
    
    if (tesaurusText.includes('Tiada maklumat tesaurus')) {
      return undefined;
    }
    
    return tesaurusText;
  }

  /**
   * Get a simple Malay definition for a word
   * @param word - The English word to search for
   * @returns Promise<string | null> - The Malay definition or null if not found
   */
  async getDefinition(word: string): Promise<string | null> {
    try {
      const result = await this.search(word, { 
        includeRelated: false, 
        includePeribahasa: false, 
        includeTesaurus: false 
      });
      
      if (result.definitions.length > 0) {
        return result.definitions[0].malayDefinition;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting definition for "${word}":`, error);
      return null;
    }
  }

  /**
   * Search for multiple words and get their definitions
   * @param words - Array of English words to search for
   * @param options - Search options
   * @returns Promise<Map<string, DBPResult>>
   */
  async searchMultiple(words: string[], options: SearchOptions = {}): Promise<Map<string, DBPResult>> {
    const results = new Map<string, DBPResult>();
    
    for (const word of words) {
      try {
        const result = await this.search(word, options);
        results.set(word, result);
        
        // Add delay between requests to be respectful
        if (options.delay) {
          await new Promise(resolve => global.setTimeout(resolve, options.delay));
        }
      } catch (error) {
        console.error(`Error searching for "${word}":`, error);
        results.set(word, {
          word,
          definitions: [],
          hasResults: false
        });
      }
    }
    
    return results;
  }
} 