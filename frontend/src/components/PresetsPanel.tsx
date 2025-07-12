import { useState, useEffect } from 'react';
import type { Preset } from '../types';
import {
  Divider,
  TextField,
  IconButton,
  ButtonGroup,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Folder as FolderIcon,
  Terminal as TerminalIcon,
  KeyboardReturn as KeyboardReturnIcon,
} from '@mui/icons-material';

interface PresetsPanelProps {
  presets: Preset[];
  isDarkMode: boolean;
  onConnect: (target: string) => void;
  onOpenFolder: (target: string) => void;
  onPing: (target: string) => void;
}

export function PresetsPanel({ presets, onConnect, onOpenFolder, onPing }: PresetsPanelProps) {
  const [segments, setSegments] = useState<string[]>([]);

  // Сбрасываем и инициализируем поля ввода, когда меняется список пресетов
  useEffect(() => {
    setSegments(new Array(presets.length).fill(''));
  }, [presets]);

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

  return (
    <div className="rightBlock">
      <h3>Список отделений</h3>
      <div className="input-wrapper">
        <table>
          <tbody>
            {presets.map((preset, index) => {
              const fullIp = `${preset.ip}${segments[index]}`;
              const isDisabled = !segments[index];

              const handleConnect = () => {
                if (!isDisabled) {
                  onConnect(fullIp);
                  handleSegmentChange(index, '');
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
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConnect(); }}
                      size="small"
                      sx={{ width: '4ch' }}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <ButtonGroup variant="outlined">
                      <IconButton title='Подключиться' color='primary' disabled={isDisabled} onClick={handleConnect}>
                        <KeyboardReturnIcon />
                      </IconButton>
                      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                      <IconButton title='Открыть локальную папку' color='primary' disabled={isDisabled} onClick={() => onOpenFolder(fullIp)}>
                        <FolderIcon />
                      </IconButton>
                      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                      <IconButton title='Ping' color='primary' disabled={isDisabled} onClick={() => onPing(fullIp)}>
                        <TerminalIcon />
                      </IconButton>
                      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                      <IconButton title='Очистить поле' color="error" disabled={isDisabled} onClick={() => handleSegmentChange(index, '')}>
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
  );
}