import React, { useState } from 'react';
import { ImportExportData } from '../../types/global';
import { storage } from '../../lib/storage';

export const ImportExportPanel: React.FC = () => {
  const [importData, setImportData] = useState<ImportExportData | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [status, setStatus] = useState('');

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `room-assets-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Экспорт завершен');
    } catch (error) {
      setStatus(`Ошибка экспорта: ${error}`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ImportExportData;
        setImportData(data);
        setStatus(`Загружено: ${data.rooms.length} аудиторий, ${data.assets.length} активов, ${data.bookings.length} броней`);
      } catch (error) {
        setStatus('Ошибка чтения файла');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) return;

    try {
      await storage.importData(importData, replaceMode);
      setStatus(`Импорт завершен. Режим: ${replaceMode ? 'замена' : 'объединение'}`);
      setImportData(null);
    } catch (error) {
      setStatus(`Ошибка импорта: ${error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Импорт/Экспорт данных</h3>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Экспорт в JSON
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Скачайте все данные в формате JSON
          </p>
        </div>

        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {importData && (
          <div className="border-t pt-4">
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="mr-2"
                />
                Полная замена данных (вместо объединения)
              </label>
            </div>

            <div className="bg-gray-50 p-3 rounded mb-4">
              <h4 className="font-medium mb-2">Предпросмотр:</h4>
              <p>Аудитории: {importData.rooms.length}</p>
              <p>Активы: {importData.assets.length}</p>
              <p>Брони: {importData.bookings.length}</p>
            </div>

            <button
              onClick={handleImport}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Импортировать
            </button>
            <button
              onClick={() => setImportData(null)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        )}

        {status && (
          <div className={`mt-4 p-3 rounded ${status.includes('Ошибка') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};