import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [computers, setComputers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickConnect, setQuickConnect] = useState('');
  const [ipSegment1, setIpSegment1] = useState('');
  const [ipSegment2, setIpSegment2] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dataSource, setDataSource] = useState('csv');
  const [csvPath, setCsvPath] = useState('');

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
    axios.post(`http://localhost:8000/connect/${target}`);
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
    const valid = val.replace(/[^a-zA-Zа-яА-Я0-9\-_]/g, '');
    setter(valid);
  };

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
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
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
              >✕</button>
            )}
          </div>

          <button onClick={fetchComputers} className="button">
            Обновить список
          </button>
          <label className="themeToggle">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Темная тема
          </label>
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
                      <button onClick={() => connect(c.ip)}>Подключиться</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="3" className="noResults">Ничего не найдено</td></tr>
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
          <button
            title="Параметры"
            onClick={() => setShowSettings(!showSettings)}
            style={{ width: '36px', height: '36px', fontSize: '20px', borderRadius: '6px', cursor: 'pointer' }}>
            ⚙
          </button>
        </div>

        <div className="rightBlock">
          <h3>Быстрое подключение</h3>
          <input
            type="text"
            placeholder="Имя или IP"
            value={quickConnect}
            onChange={handleValidatedInput(setQuickConnect)}
            style={{ width: '60%', margin: '6px' }}
          />
          <button onClick={() => connect(quickConnect)} style={{ marginTop: '5px' }}>Подключиться</button>

          <div style={{ marginTop: '15px' }}>
            <label>IP: 10.114.</label>
            <input
              type="text"
              value={ipSegment1}
              onChange={handleIpChange(setIpSegment1)}
              maxLength={3}
              style={{ width: '50px', margin: '0 5px' }}
            />
            <span>.</span>
            <input
              type="text"
              value={ipSegment2}
              onChange={handleIpChange(setIpSegment2)}
              maxLength={3}
              style={{ width: '50px', margin: '0 5px' }}
            />
            <button
              onClick={() => connect(`10.114.${ipSegment1}.${ipSegment2}`)}
              style={{ marginLeft: '10px' }}
              disabled={!ipSegment1 || !ipSegment2}
            >Подключиться</button>
          </div>
        </div>

        <div className="rightBlock"><h3>Таблица зарезервированных станций (будет с БД)</h3></div>
        <div className="rightBlock"><h3>Ещё один блок</h3></div>
      </div>
    </div>
  );
}

export default App;
