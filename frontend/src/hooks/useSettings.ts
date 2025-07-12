import { api } from '../api';
import type { Settings } from '../types';
import { useState, useEffect } from 'react';

const initialSettings: Settings = {
  cmrcviewer_path: '',
  presets: [],
  dataSource: 'ps',
  csvPath: '',
  psScriptPath: '',
  showPresetsBlock: true,
  reservedComputers: [],
  showReservedComputersBlock: true,
  theme: "system"
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const fetchSettings = async () => {
    try {
      const response = await api.getSettings();
      // Устанавливаем значения по-умолчанию, если их нет в ответе сервера
      setSettings({
        ...initialSettings,
        ...response.data,
      });
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error);
      // В случае ошибки возвращаемся к дефолтным настройкам
      setSettings(initialSettings);
    }
  };
  
  // Загружаем настройки при первом рендере
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const saveSettings = async () => {
    await api.saveSettings(settings);
    await fetchSettings(); // Перезагружаем настройки после сохранения
  };

  const updateSettings = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  return {
    settings,
    fetchSettings,
    saveSettings,
    updateSettings,
  };
}