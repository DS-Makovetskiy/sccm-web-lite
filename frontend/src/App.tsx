import { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import './App.css';
import React from 'react';

// Импорты Material-UI
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import ButtonGroup from '@mui/material/ButtonGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';

// Иконки
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/clear';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import FolderIcon from '@mui/icons-material/Folder';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';


interface Computer {
  name: string;
  fio: string;
}

interface Preset {
  name:string;
  ip: string;
}

interface Settings {
  cmrcviewer_path: string;
  presets: Preset[];
  dataSource: 'csv' | 'ps' | 'direct-ad';
  csvPath: string;
  psScriptPath: string;
  showPresetsBlock: boolean;
  reservedComputers: ReservedComputer[];
  showReservedComputersBlock: boolean;
}

interface ReservedComputer {
  name: string;
  target: string;
}

function App() {
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickConnect, setQuickConnect] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);


  useEffect(() => {
    fetchComputers();
    const interval = setInterval(fetchComputers, 300_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchComputers(); 
  }, []);

  useEffect(() => {
    if (!showSettings) {
      fetchComputers();
    }
  }, [showSettings]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleIpChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d{0,3}$/.test(val)) {
      const num = parseInt(val);
      if (!isNaN(num) && num >= 0 && num <= 255 || val === '') {
        setter(val);
      }
    }
  };

  const [settings, setSettings] = useState<Settings>({
    cmrcviewer_path: '',
    presets: [],
    dataSource: 'ps',
    csvPath: '',
    psScriptPath: '',
    showPresetsBlock: true,
    reservedComputers: [],
    showReservedComputersBlock: true,
  });


  const handleBrowse = async (fileType: 'exe' | 'csv' | 'ps1') => {
    try {
      const response = await axios.get('http://localhost:8000/browse-file', { params: { file_type: fileType }});
      const path = response.data.path;
      if (path) {
        if (fileType === 'exe') {
          handleSettingsChange('cmrcviewer_path', path);
        } else if (fileType === 'csv') {
          handleSettingsChange('csvPath', path);
        } else if (fileType === 'ps1') {
          handleSettingsChange('psScriptPath', path);
        }
      }
    } catch (error) {
      console.error("Ошибка при выборе файла:", error);
      setAlert({ message: "Не удалось открыть диалог выбора файла на сервере.", severity: 'error' });
    }
  };
  
  const fetchComputers = () => {
    setLoading(true);
    axios.get('http://localhost:8000/computers')
      .then(res => {
        setComputers(res.data);
      })
      .catch(err => {
        console.error("Ошибка при загрузке списка компьютеров:", err);
        setComputers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchSettings = () => {
    axios.get('http://localhost:8000/settings')
      .then(res => {
        setSettings({
          ...res.data,
          showPresetsBlock: res.data.showPresetsBlock ?? true,
          reservedComputers: res.data.reservedComputers ?? [],
          showReservedComputersBlock: res.data.showReservedComputersBlock ?? true,
        });
        setSegments(new Array(res.data.presets.length).fill(''));
      })
      .catch(err => console.error("Ошибка загрузки настроек:", err));
  };

  const handleSaveSettings = () => {
    axios.post('http://localhost:8000/settings', settings)
      .then(() => {
        setAlert({ message: 'Настройки успешно сохранены!', severity: 'success' });
        fetchSettings();
        fetchComputers();
        setShowSettings(false);
      })
      .catch(err => {
        setAlert({ message: `Ошибка сохранения настроек: ${err?.response?.data?.detail || 'неизвестная ошибка'}`, severity: 'error' });
      });
  };

  const filtered = computers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const connect = (target: string) => {
    if (!target.trim()) return;
    axios.get(`http://localhost:8000/launch`, { params: { ip: target } })
    .then(() => {
      console.log(`Подключение к ${target} запущено`);
    })
    .catch((err) => {
      console.error(`Ошибка при подключении к ${target}:`, err);
      setAlert({ message: `Ошибка: ${err?.response?.data?.detail || 'не удалось подключиться'}`, severity: 'error' });
    });
    setQuickConnect('');
  };

  const handleValidatedInput = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.replace(/[^a-zA-Zа-яА-Я0-9\-_.\sҚқІіҢңҒғҮүҰұӨөҺһ]/g, ''));
  };

  const handleSegmentChange = (index: number, value: string) => {
    if (/^\d{0,3}$/.test(value)) {
      const num = parseInt(value, 10);
      if (value === '' || (num >= 0 && num <= 255)) {
        const newSegments = [...segments];
        newSegments[index] = value;
        setSegments(newSegments);
      }
    }
  };
  
  const handleSettingsChange = (field: keyof Settings, value: any) => {
      setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePresetChange = (index: number, field: keyof Preset, value: string) => {
      const newPresets = [...settings.presets];
      const sanitizedValue = field === 'ip' ? value.replace(/[^0-9.]/g, '') : value;
      newPresets[index] = { ...newPresets[index], [field]: sanitizedValue };
      handleSettingsChange('presets', newPresets);
  };
  
  const handleAddPreset = () => {
      handleSettingsChange('presets', [...settings.presets, { name: '', ip: '' }]);
  };

  const handleRemovePreset = (index: number) => {
      const newPresets = settings.presets.filter((_, i) => i !== index);
      handleSettingsChange('presets', newPresets);
  };

  const handleReservedComputerChange = (index: number, field: keyof ReservedComputer, value: string) => {
    const newReservedComputers = [...settings.reservedComputers];
    newReservedComputers[index] = { ...newReservedComputers[index], [field]: value };
    handleSettingsChange('reservedComputers', newReservedComputers);
  };

  const handleAddReservedComputer = () => {
    handleSettingsChange('reservedComputers', [...settings.reservedComputers, { name: '', target: '' }]);
  };

  const handleRemoveReservedComputer = (index: number) => {
    const newReservedComputers = settings.reservedComputers.filter((_, i) => i !== index);
    handleSettingsChange('reservedComputers', newReservedComputers);
  };

  const openFolder = (target: string) => {
    if (!target.trim()) return;
    axios.get(`http://localhost:8000/open-folder`, { params: { target: target } })
    .then(() => {
      console.log(`Попытка открыть папку для ${target}`);
    })
    .catch((err) => {
      console.error(`Ошибка при открытии папки для ${target}:`, err);
      setAlert({ message: `Ошибка: ${err?.response?.data?.detail || 'не удалось открыть папку'}`, severity: 'error' });
    });
  };

  const pingTarget = (target: string) => {
    if (!target.trim()) return;
    axios.get(`http://localhost:8000/ping`, { params: { target: target } })
    .then(() => {
      console.log(`Пинг ${target} запущен`);
    })
    .catch((err) => {
      console.error(`Ошибка при пинге ${target}:`, err);
      setAlert({ message: `Ошибка: ${err?.response?.data?.detail || 'не удалось запустить пинг'}`, severity: 'error' });
    });
  };

  return (
    <div className={`container ${isDarkMode ? 'dark' : ''}`}>
      {alert && (
        <Box sx={{ position: 'fixed', top: 10, left: '40%' }}>
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

        <div className="controls">
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 500 }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Поиск по ФИО или имени ПК"
              inputProps={{ 'aria-label': 'Поиск по ФИО или имени ПК' }}
              value={searchTerm}
              onChange={handleValidatedInput(setSearchTerm)}
              autoComplete="off"
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton 
              title='Очистить поле'
              color="error" 
              sx={{ p: '10px' }} 
              aria-label="clear"
              disabled={!searchTerm}
              onClick={() => setSearchTerm('')}
            >
              <ClearIcon />
            </IconButton>
          </Paper>

          <LoadingButton
            loading={loading}
            loadingPosition="start"
            startIcon={<RefreshIcon />}
            variant="standard"
            onClick={fetchComputers}
          >
            Обновить список
          </LoadingButton>

          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Имя или IP"
              inputProps={{ 'aria-label': 'Имя или IP' }}
              value={quickConnect}
              onChange={handleValidatedInput(setQuickConnect)}
              onKeyPress={(e) => { 
                if (e.key === 'Enter' && quickConnect) {
                  connect(quickConnect);
                }
              }}
              autoComplete="off"
            />
            <IconButton 
              title='Подключиться'
              type="button" 
              sx={{ p: '10px' }} 
              aria-label="search"
              color='primary'
              disabled={!quickConnect}
              onClick={() => connect(quickConnect)}
            >
              <KeyboardReturnIcon />
            </IconButton>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton 
              title='Открыть локальную папку'
              type="button" 
              sx={{ p: '10px' }} 
              aria-label="search"
              color='primary'
              disabled={!quickConnect}
              onClick={() => openFolder(quickConnect)}
            >
              <FolderIcon />
            </IconButton>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton 
              title='Ping'
              type="button" 
              sx={{ p: '10px' }} 
              aria-label="search"
              color='primary'
              disabled={!quickConnect}
              onClick={() => pingTarget(quickConnect)}
            >
              <TerminalIcon />
            </IconButton>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton 
              title='Очистить поле'
              color="error" 
              sx={{ p: '10px' }} 
              aria-label="clear"
              disabled={!quickConnect}
              onClick={() => setQuickConnect('')}
            >
              <ClearIcon />
            </IconButton>
          </Paper>

        </div>

        {showSettings ? (
          <div className="settingsPanel scrollableSettings">
            
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Параметры</h2>
              <div style={{alignContent: 'center'}}>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSaveSettings}>
                  Сохранить и закрыть
                </Button>
              </div>
            </div> */}
            <Grid 
              container
              direction="row"
              spacing={6}
              sx={{
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            > 
              <Grid item size={6}>
                <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormLabel component="legend">Основные параметры</FormLabel>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <TextField
                      label="Путь к CmRcViewer.exe"
                      variant="standard"
                      fullWidth
                      value={settings.cmrcviewer_path}
                      onChange={(e) => handleSettingsChange('cmrcviewer_path', e.target.value)}
                    />
                    <Button variant="outlined" size="small" onClick={() => handleBrowse('exe')}>Обзор...</Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item size={6}> {/* Fourth block (empty for now) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl component="fieldset">
                      <FormLabel component="legend">Источник данных</FormLabel>
                      <RadioGroup
                        row
                        aria-label="data-source"
                        name="data-source"
                        value={settings.dataSource}
                        onChange={(e) => handleSettingsChange('dataSource', e.target.value)}
                      >
                        <FormControlLabel value="csv" control={<Radio />} label="CSV-файл" />
                        <FormControlLabel value="ps" control={<Radio />} label="PowerShell-скрипт" />
                        <FormControlLabel value="direct-ad" control={<Radio />} label="Прямой запрос к AD" disabled />
                      </RadioGroup>
                  </FormControl>

                  {settings.dataSource === 'csv' && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <TextField
                        label="Путь к CSV файлу"
                        variant="standard"
                        fullWidth
                        value={settings.csvPath}
                        onChange={(e) => handleSettingsChange('csvPath', e.target.value)}
                      />
                      <Button variant="outlined" size="small" onClick={() => handleBrowse('csv')}>Обзор...</Button>
                    </Box>
                  )}

                  {settings.dataSource === 'ps' && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <TextField
                        label="Путь к PowerShell скрипту"
                        variant="standard"
                        fullWidth
                        value={settings.psScriptPath}
                        onChange={(e) => handleSettingsChange('psScriptPath', e.target.value)}
                      />
                      <Button variant="outlined" size="small" onClick={() => handleBrowse('ps1')}>Обзор...</Button>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item size={6}> {/* Second block */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showPresetsBlock}
                          onChange={(e) => handleSettingsChange('showPresetsBlock', e.target.checked)}
                          name="showPresetsBlockSwitch"
                        />
                      }
                      label="Показывать блок 'Список отделений'"
                    />
                  </FormGroup>
                  
                  <fieldset disabled={!settings.showPresetsBlock}>
                    <FormLabel component="legend">Предустановленные IP</FormLabel>
                    {settings.presets.map((preset, index) => (
                      <Box key={index} className="settings-preset-row">
                        <TextField
                          label="Название отделения"
                          variant="standard"
                          value={preset.name}
                          onChange={(e) => handlePresetChange(index, 'name', e.target.value)}
                          disabled={!settings.showPresetsBlock}
                        />
                        <TextField
                          label="IP-префикс"
                          variant="standard"
                          placeholder="10.114.2."
                          value={preset.ip}
                          onChange={(e) => handlePresetChange(index, 'ip', e.target.value)}
                          disabled={!settings.showPresetsBlock}
                        />
                        <IconButton onClick={() => handleRemovePreset(index)} color="error" size="small" disabled={!settings.showPresetsBlock}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddPreset} sx={{ mt: 1 }} disabled={!settings.showPresetsBlock}>
                        Добавить
                    </Button>
                  </fieldset>
                </Box>
              </Grid>

              <Grid item size={6}> {/* Third block */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showReservedComputersBlock}
                          onChange={(e) => handleSettingsChange('showReservedComputersBlock', e.target.checked)}
                          name="showReservedComputersBlockSwitch"
                        />
                      }
                      label="Показывать блок 'Зарезервированные компьютеры'"
                    />
                  </FormGroup>

                  <fieldset disabled={!settings.showReservedComputersBlock}>
                    <FormLabel component="legend">Зарезервированные компьютеры</FormLabel>
                    <Grid container spacing={2}>
                      {settings.reservedComputers.map((reserved, index) => (
                        <Grid item key={index}>
                          <Box className="settings-preset-row" sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '30ch'}}>
                            <TextField
                              label="Название"
                              variant="standard"
                              fullWidth
                              value={reserved.name}
                              onChange={(e) => handleReservedComputerChange(index, 'name', e.target.value)}
                              disabled={!settings.showReservedComputersBlock}
                            />
                            <TextField
                              label="Имя или IP"
                              variant="standard"
                              fullWidth
                              value={reserved.target}
                              onChange={(e) => handleReservedComputerChange(index, 'target', e.target.value)}
                              disabled={!settings.showReservedComputersBlock}
                            />
                            <IconButton onClick={() => handleRemoveReservedComputer(index)} color="error" size="small" disabled={!settings.showReservedComputersBlock}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddReservedComputer} sx={{ mt: 1 }} disabled={!settings.showReservedComputersBlock}>
                        Добавить
                    </Button>
                  </fieldset>
                </Box>
              </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSaveSettings}>
                Сохранить параметры
              </Button>
            </div>
          </div>
        ) : (
          <div className="tableContainer">
            <table className="table">
              <thead className="thead">
                <tr>
                  <th className="th">ФИО</th>
                  <th className="th">Имя ПК</th>
                  <th className="th">Действие</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="noResults">Загрузка...</td></tr>
                ) : filtered.length > 0 ? (
                  filtered.map((c, i) => (
                    <tr key={i}>
                      <td className="td">{c.name}</td>
                      <td className="td">{c.fio}</td>
                      <td className="td">
                        <button onClick={() => connect(c.name)} className="button">Подключиться</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="noResults">Ничего не найдено</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rightPane">
        <div className="rightBlock" style={{ height: '40px' }}>
          <div className='button-wrapper'>
            <IconButton 
              title='Параметры'
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton 
              title={ isDarkMode ? 'Светлая тема' : 'Темная тема' }
              type="button"
              onClick={toggleTheme}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </div>
        </div>

        {settings.showPresetsBlock && (
          <div className="rightBlock">
            <h3>Список отделений</h3>
            <div className="input-wrapper">
              <table>
                <tbody>
                  {settings.presets.map((preset, index) => {
                    const handleConnect = () => {
                      if(segments[index]) {
                        connect(`${preset.ip}${segments[index]}`);
                        handleSegmentChange(index, '');
                      }
                    };
                    const handleOpenFolderPreset = () => {
                      if (segments[index]) {
                        openFolder(`${preset.ip}${segments[index]}`);
                      }
                    };
                    const handlePingPreset = () => {
                      if (segments[index]) {
                        pingTarget(`${preset.ip}${segments[index]}`);
                      }
                    };
                    return (
                      <tr key={preset.name + index}>
                        <td style={{ verticalAlign: 'middle', paddingRight: '15px' }}>
                          <strong>{preset.name}</strong>
                        </td>
                        <td>
                          <label>IP: {preset.ip}</label>
                          <TextField
                            variant="standard"
                            value={segments[index] || ''}
                            onChange={(e) => handleSegmentChange(index, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && segments[index]) {
                                handleConnect();
                              }
                            }}
                            size="small"
                            sx={{ width: '4ch' }}
                            inputProps={{ style: { color: isDarkMode ? '#fff' : 'inherit' } }}
                            autoComplete="off"
                          />
                        </td>
                        <td>
                          <ButtonGroup variant="outlined">
                            <IconButton
                              title='Подключиться'
                              type="button"
                              sx={{ p: '10px' }}
                              color='primary'
                              disabled={!segments[index]}
                              onClick={handleConnect}
                            >
                              <KeyboardReturnIcon />
                            </IconButton>
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <IconButton
                              title='Открыть локальную папку'
                              type="button"
                              sx={{ p: '10px' }}
                              color='primary'
                              disabled={!segments[index]}
                              onClick={handleOpenFolderPreset}
                            >
                              <FolderIcon />
                            </IconButton>
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <IconButton
                              title='Ping'
                              type="button"
                              sx={{ p: '10px' }}
                              aria-label="search"
                              color='primary'
                              disabled={!segments[index]}
                              onClick={handlePingPreset}
                            >
                              <TerminalIcon />
                            </IconButton>
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <IconButton
                              title='Очистить поле'
                              color="error"
                              sx={{ p: '10px' }}
                              aria-label="clear"
                              disabled={!segments[index]}
                              onClick={() => handleSegmentChange(index, '')}
                            >
                              <ClearIcon />
                            </IconButton>
                          </ButtonGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {settings.showReservedComputersBlock && (
          <div className="rightBlock">
            <h3>Зарезервированные компьютеры</h3>
            <div className="input-wrapper">
              <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
                {settings.reservedComputers.map((reserved, index) => (
                  <Grid item xs={12} sm={6} key={reserved.name + index}>
                    <ButtonGroup variant="contained" sx={{ width: '27ch' }}>
                      <Button
                        title={`Подключиться`}
                        onClick={() => connect(reserved.target)}
                        disabled={!reserved.target}
                        sx={{ flexGrow: 1 }} // Allow button to grow
                      >
                        {reserved.name}
                      </Button>
                      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                      <IconButton
                        title='Открыть локальную папку'
                        type="button"
                        sx={{ p: '10px' }}
                        color='primary'
                        disabled={!reserved.target}
                        onClick={() => openFolder(reserved.target)}
                      >
                        <FolderIcon />
                      </IconButton>
                      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                      <IconButton
                        title='Ping'
                        type="button"
                        sx={{ p: '10px' }}
                        aria-label="ping"
                        color='primary'
                        disabled={!reserved.target}
                        onClick={() => pingTarget(reserved.target)}
                      >
                        <TerminalIcon />
                      </IconButton>
                    </ButtonGroup>
                  </Grid>
                ))}
              </Grid>
            </div>
          </div>
        )}
        {/* <div className="rightBlock"><h3>Дополнительный блок</h3></div> */}
      </div>
    </div>
  );
}

export default App;