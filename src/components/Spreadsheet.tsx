import React, { useState } from 'react';
import './Spreadsheet.css';

interface TimeCardData {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  totalHours: string;
}

interface SpreadsheetProps {
  data: TimeCardData[];
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ data }) => {
  const [tableData, setTableData] = useState<TimeCardData[]>(data);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // propsのdataが変更されたときにtableDataを更新
  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  const headers = [
    { key: 'date', label: '日付' },
    { key: 'startTime', label: '開始時刻' },
    { key: 'endTime', label: '終了時刻' },
    { key: 'breakTime', label: '休憩時間(分)' },
    { key: 'totalHours', label: '総労働時間' }
  ];

  const handleCellClick = (rowIndex: number, colKey: string, value: string) => {
    setEditingCell({ row: rowIndex, col: colKey });
    setEditValue(value);
  };

  const handleCellEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellSave = () => {
    if (editingCell) {
      const newData = [...tableData];
      newData[editingCell.row] = {
        ...newData[editingCell.row],
        [editingCell.col]: editValue
      };
      setTableData(newData);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const addNewRow = () => {
    const newRow: TimeCardData = {
      id: Date.now(),
      date: '',
      startTime: '',
      endTime: '',
      breakTime: '',
      totalHours: ''
    };
    setTableData([...tableData, newRow]);
  };

  const deleteRow = (index: number) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  const exportToCSV = () => {
    const csvContent = [
      headers.map(h => h.label).join(','),
      ...tableData.map(row => 
        headers.map(h => row[h.key as keyof TimeCardData]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'timecard_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="spreadsheet">
      <div className="spreadsheet-header">
        <h2>タイムカードデータ</h2>
        <div className="spreadsheet-actions">
          <button className="add-row-btn" onClick={addNewRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            行を追加
          </button>
          <button className="export-btn" onClick={exportToCSV}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CSVエクスポート
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header.key}>{header.label}</th>
              ))}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={row.id}>
                {headers.map(header => {
                  const cellKey = header.key as keyof TimeCardData;
                  const cellValue = String(row[cellKey]);
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === header.key;

                  return (
                    <td key={header.key} onClick={() => handleCellClick(rowIndex, header.key, cellValue)}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={handleCellEdit}
                          onBlur={handleCellSave}
                          onKeyDown={handleKeyPress}
                          autoFocus
                          className="cell-input"
                        />
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteRow(rowIndex)}
                    title="行を削除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tableData.length === 0 && (
        <div className="empty-state">
          <p>データがありません。画像をアップロードしてOCR処理を実行してください。</p>
        </div>
      )}
    </div>
  );
};

export default Spreadsheet; 