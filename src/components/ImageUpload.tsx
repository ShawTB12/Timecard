import React, { useCallback, useState, useMemo, useEffect } from 'react';
import './ImageUpload.css';
import AIocRService, { AIModel, TimeCardEntry } from '../services/aiOcrService';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onOcrComplete: (data: TimeCardEntry[]) => void;
  uploadedImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, onOcrComplete, uploadedImage }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt4');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ openai: boolean; gemini: boolean }>({ openai: false, gemini: false });
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AIサービスのインスタンスを作成（useMemoで最適化）
  const aiOcrService = useMemo(() => new AIocRService(), []);

  const processImage = useCallback((file: File) => {
    setIsProcessing(true);
    setOcrError(null);
    
    // ファイル情報を保存
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setImageInfo({
      name: file.name,
      size: `${sizeInMB} MB`
    });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
      setIsProcessing(false);
      
      // APIキーの状況をチェック
      const status = aiOcrService.getApiStatus();
      setApiStatus(status);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, aiOcrService]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImage(imageFile);
    }
  }, [processImage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  }, [processImage]);

  // AI OCR処理を実行
  const handleOcrProcess = useCallback(async (model: AIModel | 'both') => {
    console.log('OCR処理開始:', model);
    console.log('uploadedImage:', uploadedImage ? 'あり' : 'なし');
    
    if (!uploadedImage) {
      console.error('画像がアップロードされていません');
      return;
    }

    setIsOcrProcessing(true);
    setOcrError(null);

    try {
      if (model === 'both') {
        // 両方のモデルで処理
        console.log('両方のモデルで処理開始');
        const result = await aiOcrService.processWithBothModels(uploadedImage);
        console.log('両方のモデル処理結果:', result);
        
        if (result.recommendedResult.success) {
          console.log('推奨結果を右側に送信:', result.recommendedResult.data);
          onOcrComplete(result.recommendedResult.data);
        } else {
          console.error('推奨結果エラー:', result.recommendedResult.error);
          setOcrError(result.recommendedResult.error || '両方のAIモデルで処理に失敗しました');
        }
      } else {
        // 単一モデルで処理
        console.log('単一モデルで処理開始:', model);
        const result = await aiOcrService.processTimeCard(uploadedImage, model);
        console.log('単一モデル処理結果:', result);
        
        if (result.success) {
          console.log('結果を右側に送信:', result.data);
          onOcrComplete(result.data);
        } else {
          console.error('単一モデルエラー:', result.error);
          setOcrError(result.error || 'OCR処理に失敗しました');
        }
      }
    } catch (error) {
      console.error('OCR処理エラー:', error);
      setOcrError(error instanceof Error ? error.message : '予期しないエラーが発生しました');
    } finally {
      setIsOcrProcessing(false);
    }
  }, [uploadedImage, aiOcrService, onOcrComplete]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // モーダル表示時はbodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // 画像拡大表示
  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  // モーダル閉じる
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="image-upload">
      <h2>タイムカード画像をアップロード</h2>
      <p className="upload-description">
        タイムカードの画像をドラッグ&ドロップするか、クリックしてファイルを選択してください
      </p>
      
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${uploadedImage ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!uploadedImage ? (
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <p className="upload-text">画像をドラッグ&ドロップ</p>
            <p className="upload-subtext">または</p>
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
              ファイルを選択
            </label>
          </div>
        ) : (
          <div className="image-preview">
            <img 
              src={uploadedImage} 
              alt="アップロードされたタイムカード" 
              onClick={handleImageClick}
              title="クリックして拡大表示"
            />
            <div className="image-overlay">
              <button
                className="change-image-btn"
                onClick={() => {
                  onImageUpload('');
                  setImageInfo(null);
                }}
              >
                別の画像を選択
              </button>
            </div>
            {imageInfo && (
              <div className="image-info">
                <p><strong>📄 {imageInfo.name}</strong></p>
                <p>サイズ: {imageInfo.size}</p>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>💡 クリックして拡大表示</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <p>画像を処理中...</p>
        </div>
      )}

                {uploadedImage && (
        <div className="upload-actions">
          <div className="model-selection">
            <label htmlFor="model-select">AIモデルを選択:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              className="model-select"
            >
              <option value="gpt4" disabled={!apiStatus.openai}>
                GPT-4.1 {!apiStatus.openai && '(APIキー未設定)'}
              </option>
              <option value="gemini" disabled={!apiStatus.gemini}>
                Gemini 2.5 {!apiStatus.gemini && '(APIキー未設定)'}
              </option>
            </select>
          </div>



          <div className="ocr-buttons">
            <button 
              className="process-btn primary"
              onClick={(e) => {
                console.log('OCRボタンクリック:', selectedModel);
                e.preventDefault();
                handleOcrProcess(selectedModel);
              }}
              disabled={isOcrProcessing || (!apiStatus.openai && !apiStatus.gemini)}
            >
              {isOcrProcessing ? (
                <>
                  <div className="spinner small"></div>
                  AI OCR処理中...
                </>
              ) : (
                `${selectedModel === 'gpt4' ? 'GPT-4.1' : 'Gemini 2.5'}でOCR実行`
              )}
            </button>

            {apiStatus.openai && apiStatus.gemini && (
              <button 
                className="process-btn secondary"
                onClick={() => handleOcrProcess('both')}
                disabled={isOcrProcessing}
              >
                {isOcrProcessing ? '処理中...' : '両方のAIで比較実行'}
              </button>
            )}
          </div>

          {ocrError && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              エラー: {ocrError}
            </div>
          )}

          {(!apiStatus.openai && !apiStatus.gemini) && (
            <div className="warning-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              APIキーが設定されていません。.envファイルにREACT_APP_OPENAI_API_KEYまたはREACT_APP_GEMINI_API_KEYを設定してください。
            </div>
          )}
        </div>
      )}

      {/* 画像拡大モーダル */}
      {isModalOpen && uploadedImage && (
        <div className="image-modal" onClick={handleModalClose}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={handleModalClose}
              title="閉じる (ESC)"
            >
              ✕
            </button>
            <img 
              src={uploadedImage} 
              alt="アップロードされたタイムカード（拡大表示）" 
              className="modal-image"
            />
            {imageInfo && (
              <div className="modal-image-info">
                <p><strong>📄 {imageInfo.name}</strong></p>
                <p>サイズ: {imageInfo.size}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 