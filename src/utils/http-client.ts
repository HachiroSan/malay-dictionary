import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
// @ts-ignore
import UserAgent from 'user-agents';
import { ScraperOptions, DBPError } from '../types';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  retries?: number;
}

export class HttpClient {
  private client: AxiosInstance;
  private userAgent: UserAgent;

  constructor(options: ScraperOptions = {}) {
    this.userAgent = new UserAgent();
    
    this.client = axios.create({
      timeout: options.timeout || 30000,
      maxRedirects: options.followRedirects !== false ? 5 : 0,
      headers: {
        'User-Agent': options.userAgent || this.userAgent.toString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Sec-GPC': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Priority': 'u=0, i'
      }
    });

    // Add request interceptor for retries
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add delay if specified
        if (options.delay) {
          return new Promise<InternalAxiosRequestConfig>((resolve) => {
            global.setTimeout(() => resolve(config), options.delay!);
          });
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response) {
          throw new DBPError(
            `HTTP ${error.response.status}: ${error.response.statusText}`,
            error.response.status,
            error.config?.url
          );
        } else if (error.request) {
          throw new DBPError(
            'Network error: No response received',
            undefined,
            error.config?.url
          );
        } else {
          throw new DBPError(
            `Request error: ${error.message}`,
            undefined,
            error.config?.url
          );
        }
      }
    );
  }

  async get(url: string, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse> {
    const retries = config?.retries || 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.client.get(url, config);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => global.setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  async post(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse> {
    const retries = config?.retries || 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.client.post(url, data, config);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => global.setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  setUserAgent(userAgent: string): void {
    this.client.defaults.headers['User-Agent'] = userAgent;
  }

  setReferer(referer: string): void {
    this.client.defaults.headers['Referer'] = referer;
  }

  setCookie(cookie: string): void {
    this.client.defaults.headers['Cookie'] = cookie;
  }
} 