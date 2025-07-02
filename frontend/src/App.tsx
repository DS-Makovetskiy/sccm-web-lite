import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import React from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import ClearIcon from '@mui/icons-material/clear';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode'; // Импортируем иконку светлого режима



function App() {
  const [computers, setComputers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickConnect, setQuickConnect] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [dataSource, setDataSource] = useState('csv');
  const [csvPath, setCsvPath] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // Состояние для темы

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchComputers = () => {
    setLoading(true);
    axios.get('http://localhost:8000/computers')
      .then(res => {
        setComputers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComputers();
    const interval = setInterval(fetchComputers, 30_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = computers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const connect = (target: string) => {
    axios.get(`http://localhost:8000/launch`, {
      params: { ip: target }
    })
    .then(() => {
      console.log(`Подключение к ${target} запущено`);
    })
    .catch((err) => {
      console.error(`Ошибка при подключении к ${target}:`, err);
      alert(`Ошибка: ${err?.response?.data?.detail || 'не удалось подключиться'}`);
    });
    setQuickConnect('');
  };

  const handleIpChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d{0,3}$/.test(val)) {
      const num = parseInt(val);
      if (!isNaN(num) && num >= 0 && num <= 255 || val === '') {
        setter(val);
      }
    }
  };

  const handleValidatedInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const valid = val.replace(/[^a-zA-Zа-яА-Я0-9\-_.\s]/g, '');
    setter(valid);
  };

  return (
    <div className={`container ${isDarkMode ? 'dark' : ''}`}>
      <div className="leftPane">
        <h1 className="header">Компьютеры филиала</h1>

        <div className="controls">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Поиск по ФИО или имени ПК"
              value={searchTerm}
              onChange={handleValidatedInput(setSearchTerm)}
              className="input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-button"
                style={{ position: 'absolute', right: '4px', top: '4px', background: 'transparent', border: 'none'  }}
              >✕</button>
            )}
          </div>

          <button onClick={fetchComputers} className="button">
            Обновить список
          </button>
          {loading && <span className="loading">Обновление...</span>}
        </div>

        {!showSettings && (
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
                {filtered.map((c, i) => (
                  <tr key={i}>
                    <td className="td">{c.fio}</td>
                    <td className="td">{c.name}</td>
                    <td className="td">
                      <button onClick={() => connect(c.name)} className="button">Подключиться</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="noResults">Ничего не найдено</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showSettings && (
          <div className="settingsPanel">
            <h2>Параметры</h2>
            <div>
              <label><strong>Источник данных:</strong></label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="source"
                    value="csv"
                    checked={dataSource === 'csv'}
                    onChange={() => setDataSource('csv')}
                  /> Из CSV файла
                </label>
                {dataSource === 'csv' && (
                  <input
                    type="text"
                    placeholder="Путь к каталогу с CSV"
                    value={csvPath}
                    onChange={e => setCsvPath(e.target.value)}
                    style={{ marginLeft: '10px' }}
                  />
                )}
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="source"
                    value="ad"
                    checked={dataSource === 'ad'}
                    onChange={() => setDataSource('ad')}
                  /> Из AD (выполнить PowerShell)
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rightPane">
        <div className="rightBlock">
          <div className='button-wrapper'>
            <IconButton 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton 
              type="button"
              onClick={toggleTheme}
              style={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </div>
        </div>

        <div className="rightBlock">
          <h3>Быстрое подключение</h3>

          <div className="input-wrapper" >
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
                color="warning" 
                sx={{ p: '10px' }} 
                aria-label="clear"
                disabled={!quickConnect}
                onClick={() => setQuickConnect('')}
              >
                <ClearIcon />
              </IconButton>
            </Paper>
          </div>

          <div className="input-wrapper">
            <table style={{ minWidth: '350px', maxWidth: '400', borderSpacing: '8px' }}>
              <tbody>
                {[
                  { branch: '0114', baseIp: '10.114.2' },
                  { branch: '0214', baseIp: '10.114.9' },
                ].map(({ branch, baseIp }) => {
                  const [segment, setSegment] = useState('');
                  const handleConnect = () => {
                    connect(`${baseIp}.${segment}`);
                    setSegment('');
                  };
                  return (
                    <tr key={branch}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <strong>Отделение {branch}</strong>
                      </td>
                      <td>
                        <label>IP: {baseIp}.</label>
                        <TextField
                          variant="standard"
                          value={segment}
                          onChange={handleIpChange(setSegment)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && segment) {
                              handleConnect();
                            }
                          }}
                          size="small"
                          sx={{ 
                            width: '3ch',
                            '& .MuiInput-underline:before': {
                              borderColor: isDarkMode ? '#888' : 'rgba(0, 0, 0, 0.42)',
                            },
                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                              borderColor: isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                            }
                          }}
                          inputProps={{ 
                            style: { color: isDarkMode ? '#fff' : 'inherit' }
                          }}
                          autoComplete="off"
                        />
                      </td>
                      <td>
                        <IconButton 
                          aria-label="KeyboardReturn"
                          disabled={!segment}
                          onClick={handleConnect}
                          style={{ color: isDarkMode ? '#fff' : 'inherit' }}
                        >
                          <KeyboardReturnIcon />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        <div className="rightBlock"><h3>Таблица зарезервированных станций (будет с БД)</h3></div>
        <div className="rightBlock"><h3>Ещё один блок</h3></div>
      </div>
    </div>
  );
}

export default App;