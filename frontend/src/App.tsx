// import React from 'react';
import { useEffect, useState, useMemo } from 'react';
import './App.css';

// API, Хуки и Компоненты
import { api } from './api';
import { useSettings } from './hooks/useSettings';
import { useComputers } from './hooks/useComputers';
import { Controls } from './components/Controls';
import { ComputerList } from './components/ComputerList';
import { PresetsPanel } from './components/PresetsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ReservedPanel } from './components/ReservedPanel';

// Типы
// import type { Settings } from './types';

// Material-UI
import { 
  Box, 
  Menu,
  Alert, 
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Error as ErrorIcon,
  Settings as SettingsIcon, 
  DarkMode as DarkModeIcon, 
  LightMode as LightModeIcon, 
  Tonality as SystemThemeIcon
} from '@mui/icons-material';

// Определяем возможные темы
type Theme = 'light' | 'dark' | 'system';

function App() {
  const { computers, loading, fetchComputers } = useComputers();
  const { settings, updateSettings, saveSettings } = useSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [quickConnect, setQuickConnect] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  // const [isDarkMode, setIsDarkMode] = useState(false);
  const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // --- Новое состояние для управления темой ---
  // const [themeMode, setThemeMode] = useState<Theme>('system');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Определяем, является ли системная тема темной
  const systemPrefersDark = useMemo(() => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches, 
  []);

  // --- ИЗМЕНЕНО: isDarkMode теперь зависит от settings.theme ---
  const isDarkMode = useMemo(() => {
    const theme = settings.theme || 'system';
    if (theme === 'system') {
      return systemPrefersDark;
    }
    return theme === 'dark';
  }, [settings.theme, systemPrefersDark]);

  // Отслеживаем изменения системной темы, чтобы обновить UI, если выбрана 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Функция-обработчик
    const handleChange = () => {
      // Чтобы компонент перерисовался, нужно изменить его состояние.
      // Здесь мы просто "переустанавливаем" то же значение, чтобы спровоцировать re-render.
      if (settings.theme === 'system') {
        updateSettings('theme', 'system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, updateSettings]);

  useEffect(() => {
    if (!showSettings) {
      fetchComputers();
    }
  }, [showSettings, fetchComputers]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // // Отслеживаем изменения системной темы
  // useEffect(() => {
  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  //   const handleChange = () => {
  //     if (themeMode === 'system') {
  //       // Форсируем перерендер для обновления isDarkMode
  //       setThemeMode('system'); 
  //     }
  //   };
  //   mediaQuery.addEventListener('change', handleChange);
  //   return () => mediaQuery.removeEventListener('change', handleChange);
  // }, [themeMode]);

  const filteredComputers = useMemo(() =>
    computers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fio.toLowerCase().includes(searchTerm.toLowerCase())
    ), [computers, searchTerm]);

  const handleApiAction = async (action: Promise<any>, successMessage?: string) => {
    try {
      await action;
      if (successMessage) console.log(successMessage);
    } catch (err: any) {
      console.error("Ошибка API:", err);
      const detail = err?.response?.data?.detail || 'Неизвестная ошибка';
      setAlert({ message: `Ошибка: ${detail}`, severity: 'error' });
    }
  };

  const connect = (target: string) => {
    if (!target.trim()) return;
    handleApiAction(api.launchRdp(target), `Подключение к ${target} запущено`);
    setQuickConnect('');
  };

  const openFolder = (target: string) => {
    if (!target.trim()) return;
    handleApiAction(api.openFolder(target), `Попытка открыть папку для ${target}`);
  };

  const pingTarget = (target: string) => {
    if (!target.trim()) return;
    handleApiAction(api.pingTarget(target), `Пинг ${target} запущен`);
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettings();
      setAlert({ message: 'Настройки успешно сохранены!', severity: 'success' });
      setShowSettings(false);
    } catch (err) {
      console.error("Ошибка сохранения настроек:", err);
      setAlert({ message: `Не удалось сохранить настройки`, severity: 'error' });
    }
  };

  // --- Функции для управления меню темы ---
  const handleThemeButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // --- ИЗМЕНЕНО: Функция теперь обновляет тему в общем объекте настроек ---
  const handleThemeChange = (newTheme: Settings['theme']) => {
    updateSettings('theme', newTheme);
    handleMenuClose();
  };

  // --- ИЗМЕНЕНО: Иконка теперь зависит от settings.theme ---
  const ThemeIcon = {
    light: LightModeIcon,
    dark: DarkModeIcon,
    system: SystemThemeIcon,
  }[settings.theme || 'system'];

  // const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`container ${isDarkMode ? 'dark' : ''}`}>
      {alert && (
        <Box sx={{ position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
          <Alert 
            icon={alert.severity === 'success' ? <CheckIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />} 
            severity={alert.severity}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        </Box>
      )}
      <div className="leftPane">
        <h2 className="header">Компьютеры филиала</h2>

        <Controls
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          loading={loading}
          onRefresh={fetchComputers}
          quickConnect={quickConnect}
          onQuickConnectChange={setQuickConnect}
          onConnect={connect}
          onOpenFolder={openFolder}
          onPing={pingTarget}
        />        

        {showSettings ? (
           <SettingsPanel
              settings={settings}
              onSettingsChange={updateSettings}
              onSave={handleSaveSettings}
              onSetAlert={(message, severity) => setAlert({ message, severity })}
           />
        ) : (
          <ComputerList
            computers={filteredComputers}
            loading={loading}
            onConnect={connect}
          />
        )}
      </div>

      <div className="rightPane">
        <div className="rightBlock" style={{ height: '40px' }}>
          <div className='button-wrapper'>
            <IconButton 
              title='Параметры'
              onClick={() => setShowSettings(!showSettings)}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              <SettingsIcon />
            </IconButton>

            <IconButton 
              title='Выбрать тему'
              onClick={handleThemeButtonClick}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              <ThemeIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleThemeChange('light')}>
                <ListItemIcon>
                  <LightModeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Светлая</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('dark')}>
                <ListItemIcon>
                  <DarkModeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Темная</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('system')}>
                <ListItemIcon>
                  <SystemThemeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Как в системе</ListItemText>
              </MenuItem>
            </Menu>

            {/* --- Новая кнопка переключения темы с меню ---
            <IconButton 
              title='Выбрать тему'
              onClick={handleThemeButtonClick}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              <ThemeIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleThemeChange('light')}>
                <ListItemIcon>
                  <LightModeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Светлая</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('dark')}>
                <ListItemIcon>
                  <DarkModeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Темная</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('system')}>
                <ListItemIcon>
                  <SystemThemeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Как в системе</ListItemText>
              </MenuItem>
            </Menu> */}

            {/* <IconButton 
              title={ isDarkMode ? 'Светлая тема' : 'Темная тема' }
              onClick={toggleTheme}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton> */}
          </div>
        </div>

        {settings.showPresetsBlock && (
          <PresetsPanel
            presets={settings.presets}
            isDarkMode={isDarkMode}
            onConnect={connect}
            onOpenFolder={openFolder}
            onPing={pingTarget}
          />
        )}

        {settings.showReservedComputersBlock && (
          <ReservedPanel
            computers={settings.reservedComputers}
            onConnect={connect}
            onOpenFolder={openFolder}
            onPing={pingTarget}
          />
        )}
      </div>
    </div>
  );
}

export default App;