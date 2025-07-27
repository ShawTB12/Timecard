import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数からAPIキーを取得
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

// デバッグ用：環境変数の確認
console.log('環境変数デバッグ:', {
  OPENAI_KEY_EXISTS: !!OPENAI_API_KEY,
  GEMINI_KEY_EXISTS: !!GEMINI_API_KEY,
  OPENAI_KEY_PREFIX: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'なし',
  ALL_ENV_VARS: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

// AIモデルの選択肢
export type AIModel = 'gpt4' | 'gemini';

// タイムカードデータの型定義
export interface TimeCardEntry {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  totalHours: string;
}

// OCR処理結果の型定義
export interface OcrResult {
  success: boolean;
  data: TimeCardEntry[];
  error?: string;
  confidence?: number;
}

class AIocRService {
  private openai: OpenAI | null = null;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    console.log('AIocRService初期化開始');
    console.log('OPENAI_API_KEY:', OPENAI_API_KEY ? 'あり' : 'なし');
    console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? 'あり' : 'なし');
    
    if (OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
        console.log('OpenAI初期化成功');
      } catch (error) {
        console.error('OpenAI初期化エラー:', error);
      }
    }

    if (GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        console.log('Gemini初期化成功');
      } catch (error) {
        console.error('Gemini初期化エラー:', error);
      }
    }
    
    console.log('AIocRService初期化完了');
  }

  // 画像をBase64からファイル形式に変換
  private base64ToFile(base64String: string): string {
    return base64String.split(',')[1] || base64String;
  }

  // GPT-4を使用したOCR処理
  private async processWithGPT4(imageBase64: string): Promise<OcrResult> {
    console.log('GPT-4 OCR処理開始');
    try {
      if (!this.openai) {
        console.error('OpenAI初期化されていません');
        throw new Error('OpenAI APIキーが設定されていません');
      }
      
      console.log('OpenAI API呼び出し開始');

      console.log('使用モデル: gpt-4.1-2025-04-14');
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `この画像はタイムカードです。以下の情報を正確に抽出してJSON形式で返してください：

要求事項：
- 日付（YYYY-MM-DD形式）
- 出勤時刻（HH:MM形式）
- 退勤時刻（HH:MM形式）
- 休憩時間（分単位の数値）
- 総労働時間（小数点付き時間）

JSONの構造：
{
  "timecard_data": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "18:00",
      "breakTime": "60",
      "totalHours": "8.0"
    }
  ]
}

画像に複数日のデータがある場合は、すべてを配列に含めてください。
日本語のタイムカード形式に対応してください。`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('GPT-4から応答が取得できませんでした');
      }

      // JSONレスポンスをパース
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('有効なJSONが見つかりませんでした');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      const timeCardData = parsedData.timecard_data || [];

      const data: TimeCardEntry[] = timeCardData.map((item: any, index: number) => ({
        id: Date.now() + index,
        date: item.date || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        breakTime: item.breakTime || '',
        totalHours: item.totalHours || ''
      }));

      return {
        success: true,
        data,
        confidence: 0.9
      };

    } catch (error) {
      console.error('GPT-4 OCR処理エラー:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  }

  // Gemini 2.5を使用したOCR処理
  private async processWithGemini(imageBase64: string): Promise<OcrResult> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini APIキーが設定されていません');
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      // Base64画像データを準備
      const imageData = this.base64ToFile(imageBase64);

      const prompt = `この画像はタイムカードです。以下の情報を正確に抽出してJSON形式で返してください：

要求事項：
- 日付（YYYY-MM-DD形式）
- 出勤時刻（HH:MM形式）
- 退勤時刻（HH:MM形式）
- 休憩時間（分単位の数値）
- 総労働時間（小数点付き時間）

JSONの構造：
{
  "timecard_data": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "18:00",
      "breakTime": "60",
      "totalHours": "8.0"
    }
  ]
}

画像に複数日のデータがある場合は、すべてを配列に含めてください。
日本語のタイムカード形式に対応してください。`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const response = await result.response;
      const content = response.text();

      // JSONレスポンスをパース
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('有効なJSONが見つかりませんでした');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      const timeCardData = parsedData.timecard_data || [];

      const data: TimeCardEntry[] = timeCardData.map((item: any, index: number) => ({
        id: Date.now() + index,
        date: item.date || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        breakTime: item.breakTime || '',
        totalHours: item.totalHours || ''
      }));

      return {
        success: true,
        data,
        confidence: 0.85
      };

    } catch (error) {
      console.error('Gemini OCR処理エラー:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  }

  // メインのOCR処理メソッド
  public async processTimeCard(imageBase64: string, model: AIModel = 'gpt4'): Promise<OcrResult> {
    try {
      if (model === 'gpt4') {
        return await this.processWithGPT4(imageBase64);
      } else if (model === 'gemini') {
        return await this.processWithGemini(imageBase64);
      } else {
        throw new Error('サポートされていないAIモデルです');
      }
    } catch (error) {
      console.error('OCR処理エラー:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  }

  // 両方のAIモデルを使用して結果を比較
  public async processWithBothModels(imageBase64: string): Promise<{
    gpt4Result: OcrResult;
    geminiResult: OcrResult;
    recommendedResult: OcrResult;
  }> {
    const [gpt4Result, geminiResult] = await Promise.all([
      this.processWithGPT4(imageBase64),
      this.processWithGemini(imageBase64)
    ]);

    // 信頼度が高い方を推奨結果として選択
    const recommendedResult = 
      (gpt4Result.confidence || 0) >= (geminiResult.confidence || 0) 
        ? gpt4Result 
        : geminiResult;

    return {
      gpt4Result,
      geminiResult,
      recommendedResult
    };
  }

  // APIキーの設定状況をチェック
  public getApiStatus(): { openai: boolean; gemini: boolean } {
    return {
      openai: !!OPENAI_API_KEY && !!this.openai,
      gemini: !!GEMINI_API_KEY && !!this.genAI
    };
  }
}

export default AIocRService; 