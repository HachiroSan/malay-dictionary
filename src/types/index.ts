export interface DBPDefinition {
  word: string;
  phonetic?: string;
  jawi?: string;
  partOfSpeech?: string;
  context?: string;
  malayDefinition: string;
  source: string;
  rawText: string;
}

export interface DBPResult {
  word: string;
  definitions: DBPDefinition[];
  relatedServices?: RelatedService[];
  peribahasa?: Peribahasa[];
  tesaurus?: string;
  hasResults: boolean;
}

export interface RelatedService {
  name: string;
  count: number;
  url: string;
}

export interface Peribahasa {
  id: string;
  malayText: string;
  englishText: string;
  explanation: string;
  count: number;
}

export interface ScraperOptions {
  userAgent?: string;
  timeout?: number;
  retries?: number;
  delay?: number;
  followRedirects?: boolean;
}

export interface SearchOptions extends ScraperOptions {
  includeRelated?: boolean;
  includePeribahasa?: boolean;
  includeTesaurus?: boolean;
}

export class DBPError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public url?: string
  ) {
    super(message);
    this.name = 'DBPError';
  }
} 