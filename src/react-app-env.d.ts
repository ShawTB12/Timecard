/// <reference types="react-scripts" />

declare module 'openai' {
  export default class OpenAI {
    constructor(config: { apiKey: string; dangerouslyAllowBrowser?: boolean });
    chat: {
      completions: {
        create: (params: any) => Promise<any>;
      };
    };
  }
}

declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): {
      generateContent: (content: any[]) => Promise<{
        response: {
          text: () => string;
        };
      }>;
    };
  }
}
