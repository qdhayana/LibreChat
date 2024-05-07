const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class SearchEngineResults extends Tool {
  static lc_name() {
    return 'SearchEngineResults';
  }

  constructor(fields = {}) {
    super(fields);
    this.envVarSearchEngineUrl = 'SEARCH_ENGINE_URL';
    this.searchEngineUrl =
      fields.envVarSearchEngineUrl ?? getEnvironmentVariable(this.envVarSearchEngineUrl);
    this.name = 'search-engine';
    this.description =
      'A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events.';

    this.schema = z.object({
      query: z.string().min(1).describe('The search query string.'),
    });
  }

  async _call(input) {
    const validationResult = this.schema.safeParse(input);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validationResult.error.issues)}`);
    }

    const { query } = validationResult.data;

    const response = await fetch(`${this.searchEngineUrl}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${json.error.message}`);
    }

    return JSON.stringify(json);
  }
}

module.exports = SearchEngineResults;
