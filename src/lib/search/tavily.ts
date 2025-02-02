export interface TavilySearchResponse {
  results: Array<{
    url: string;
    content: string;
    score: number;
    title?: string;
  }>;
  query: string;
  status: 'success' | 'error';
}

export interface TavilySearchParams {
  query: string;
  search_depth?: 'basic' | 'advanced';
  include_answer?: boolean;
  include_images?: boolean;
  include_raw_content?: boolean;
  max_results?: number;
}

export interface TavilyApiError extends Error {
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
  };
}

export class TavilyClient {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.tavily.com';
  
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    
    // Add debug logging for initialization
    console.debug('[Tavily] Initializing client with API key:', {
      apiKeyPresent: !!this.apiKey,
      baseUrl: this.baseUrl
    });
  }

  async search(params: TavilySearchParams): Promise<TavilySearchResponse> {
    try {
      // Add validation for required fields
      if (!params.query || params.query.trim().length === 0) {
        throw new Error('Query parameter is required');
      }
      if (params.query.length > 300) {
        throw new Error('Query must be less than 300 characters');
      }

      const payload = {
        api_key: this.apiKey,
        ...params,
        // Ensure enum values match API expectations
        search_depth: params.search_depth || 'basic',
        // Force boolean values to prevent type mismatch
        include_answer: Boolean(params.include_answer ?? false),
        include_images: Boolean(params.include_images ?? false),
        include_raw_content: Boolean(params.include_raw_content ?? false),
        max_results: Math.min(Math.max(params.max_results ?? 5, 1), 10)
      };

      // Log full request payload before sending
      console.debug('[Tavily] Making search request:', {
        payload: {
          ...payload,
          api_key: payload.api_key ? '***REDACTED***' : 'MISSING',
          queryLength: params.query.length,
          search_depth: params.search_depth
        }
      });

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Log full response details
      console.debug('[Tavily] Received response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });

      if (!response.ok) {
        console.error('[Tavily] API Error Details:', {
          status: response.status,
          errorCode: data?.code,
          message: data?.message,
          details: data?.details
        });
        throw new Error(`Tavily API Error: ${data?.message || 'Unknown error'}`);
      }

      return data as TavilySearchResponse;
    } catch (error: unknown) {
      console.error('[Tavily] Full Error Context:', {
        params,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
          // Add response details if it's a fetch error
          status: (error as TavilyApiError).response?.status,
          statusText: (error as TavilyApiError).response?.statusText,
          responseData: (error as TavilyApiError).response?.data,
          // If it's a raw Response object
          rawResponse: error instanceof Response ? {
            status: error.status,
            statusText: error.statusText,
            headers: Object.fromEntries(error.headers?.entries() || []),
            body: await error.text().catch(() => 'Could not read response body')
          } : undefined
        } : 'Unknown error',
        requestDetails: {
          url: `${this.baseUrl}/search`,
          query: params.query,
          searchDepth: params.search_depth
        }
      });
      throw error;
    }
  }
} 