# タイムカード AI OCR ツール

タイムカード画像から勤怠データを自動抽出するAI搭載のWebアプリケーションです。GPT-4とGemini 2.5の先進的なAI技術を活用して、高精度なOCR処理を実現します。

## 🚀 主な機能

- **AI OCR処理**: GPT-4.1またはGemini 2.5を使用したタイムカード画像の自動読み取り
- **モデル選択**: AI間での精度比較と最適な結果の自動選択
- **スプレッドシート編集**: 抽出データの直接編集とリアルタイム更新
- **CSVエクスポート**: データの外部システムへの簡単な移行
- **ドラッグ&ドロップ**: 直感的な画像アップロード

## 📋 必要な環境

- Node.js 16.0.0以上
- npm または yarn
- OpenAI APIキー（GPT-4使用時）
- Google AI Studio APIキー（Gemini使用時）

## 🛠️ セットアップ

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd timecard-ocr
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
プロジェクトルートに `.env` ファイルを作成し、以下の内容を記述：

```env
# OpenAI APIキー (GPT-4用)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini APIキー (Gemini 2.5用)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. APIキーの取得方法

#### OpenAI APIキー
1. [OpenAI Platform](https://platform.openai.com/api-keys) にアクセス
2. アカウントを作成またはログイン
3. 「Create new secret key」をクリック
4. 生成されたキーを `.env` ファイルに設定

#### Google Gemini APIキー
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 生成されたキーを `.env` ファイルに設定

## 🚀 使用方法

### 開発環境での起動
```bash
npm start
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### プロダクションビルド
```bash
npm run build
```

## 📝 操作手順

1. **画像アップロード**: タイムカード画像をドラッグ&ドロップまたはファイル選択
2. **AIモデル選択**: GPT-4、Gemini 2.5、または両方を選択
3. **OCR実行**: 「AI OCR実行」ボタンをクリック
4. **データ確認**: 右側のスプレッドシートで抽出結果を確認・編集
5. **エクスポート**: 必要に応じてCSV形式でデータをダウンロード

## 🎯 サポートする画像形式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- BMP (.bmp)

## 💡 使用上の注意

- APIキーが設定されていない場合、該当するAIモデルは利用できません
- 画像は明瞭で文字が判読可能なものを使用してください
- 日本語のタイムカード形式に最適化されています
- AI処理には時間がかかる場合があります

## 🔧 利用可能なスクリプト

### `npm start`
開発モードでアプリケーションを起動します。
変更を保存すると自動的にページがリロードされます。

### `npm test`
テストランナーを対話モードで起動します。

### `npm run build`
プロダクション用にアプリケーションをビルドします。
最適化されたバンドルが `build` フォルダに生成されます。

## 🔐 セキュリティ

- APIキーは環境変数として安全に管理されます
- `.env` ファイルは `.gitignore` に含まれており、リポジトリにコミットされません
- ブラウザ側でのAPI呼び出しのため、APIキーの管理に注意してください

## 🤝 コントリビューション

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 トラブルシューティング

### API エラーが発生する場合
- APIキーが正しく設定されていることを確認
- APIキーの使用量制限をチェック
- ネットワーク接続を確認

### OCR精度が低い場合
- 画像の解像度を上げる
- 文字がクリアに見える画像を使用
- 複数のAIモデルで比較実行

### パフォーマンスの問題
- 画像サイズを最適化（推奨: 2MB以下）
- ブラウザのキャッシュをクリア
