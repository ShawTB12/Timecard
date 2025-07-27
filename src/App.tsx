import React, { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import Spreadsheet from './components/Spreadsheet';
import { TimeCardEntry } from './services/aiOcrService';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<TimeCardEntry[]>([]);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    // 画像がクリアされた場合、データもクリア
    if (!imageUrl) {
      setExtractedData([]);
    }
  };

  const handleOcrComplete = (data: TimeCardEntry[]) => {
    setExtractedData(data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>タイムカードOCRツール</h1>
        <p>画像をアップロードしてスプレッドシートに転記</p>
      </header>
      
      <main className="App-main">
        <div className="container">
          <div className="left-panel">
            <ImageUpload 
              onImageUpload={handleImageUpload} 
              onOcrComplete={handleOcrComplete}
              uploadedImage={uploadedImage} 
            />
          </div>
          <div className="right-panel">
            <Spreadsheet data={extractedData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
