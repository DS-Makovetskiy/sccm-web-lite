import type { Settings, Preset, ReservedComputer } from '../types';
import { api } from '../api';

// Material-UI
import {
  Box,
  Grid,
  Radio,
  Switch,
  Button,
  FormLabel,
  TextField,
  FormGroup,
  RadioGroup,
  IconButton,
  FormControl,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup
} from '@mui/material';

import { 
  Save as SaveIcon, 
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Tonality as SystemThemeIcon,
} from '@mui/icons-material';

interface SettingsPanelProps {
  settings: Settings;
  // onSettingsChange: (field: keyof Settings, value: any) => void;
  onSettingsChange: <K extends keyof Settings>(field: K, value: Settings[K]) => void;
  onSave: () => void;
  onSetAlert: (message: string, severity: 'success' | 'error') => void;
}

export function SettingsPanel({ settings, onSettingsChange, onSave, onSetAlert }: SettingsPanelProps) {

  const handleBrowse = async (fileType: 'exe' | 'csv' | 'ps1') => {
    try {
      const response = await api.browseFile(fileType);
      const path = response.data.path;
      if (path) {
        if (fileType === 'exe') onSettingsChange('cmrcviewer_path', path);
        else if (fileType === 'csv') onSettingsChange('csvPath', path);
        else if (fileType === 'ps1') onSettingsChange('psScriptPath', path);
      }
    } catch (error) {
      console.error("Ошибка при выборе файла:", error);
      onSetAlert("Не удалось открыть диалог выбора файла на сервере.", 'error');
    }
  };

  const handlePresetChange = (index: number, field: keyof Preset, value: string) => {
    const newPresets = [...settings.presets];
    const sanitizedValue = field === 'ip' ? value.replace(/[^0-9.]/g, '') : value;
    newPresets[index] = { ...newPresets[index], [field]: sanitizedValue };
    onSettingsChange('presets', newPresets);
  };

  const handleAddPreset = () => {
    onSettingsChange('presets', [...settings.presets, { name: '', ip: '' }]);
  };

  const handleRemovePreset = (index: number) => {
    onSettingsChange('presets', settings.presets.filter((_, i) => i !== index));
  };

  const handleReservedChange = (index: number, field: keyof ReservedComputer, value: string) => {
    const newReserved = [...settings.reservedComputers];
    newReserved[index] = { ...newReserved[index], [field]: value };
    onSettingsChange('reservedComputers', newReserved);
  };
  
  const handleAddReserved = () => {
    onSettingsChange('reservedComputers', [...settings.reservedComputers, { name: '', target: '' }]);
  };
  
  const handleRemoveReserved = (index: number) => {
    onSettingsChange('reservedComputers', settings.reservedComputers.filter((_, i) => i !== index));
  };

  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTheme: string | null,
  ) => {
    if (newTheme !== null) {
      onSettingsChange('theme', newTheme);
    }
  };

  return (
    <div className="settingsPanel scrollableSettings">
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
                  onChange={(e) => onSettingsChange('cmrcviewer_path', e.target.value)}
                />
                <Button variant="outlined" size="small" onClick={() => handleBrowse('exe')}>Обзор...</Button>
              </Box>

              <Box sx={{ mt: 2 }}>
                <FormLabel component="legend" sx={{ mb: 1 }}>Тема оформления</FormLabel>
                <ToggleButtonGroup
                  value={settings.theme}
                  exclusive
                  onChange={handleThemeChange}
                  fullWidth
                  color="primary" 
                >
                  <ToggleButton value="light">
                    <LightModeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    Светлая тема
                  </ToggleButton>
                  <ToggleButton value="system">
                    <SystemThemeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    Как в системе
                  </ToggleButton>
                  <ToggleButton value="dark">
                    <DarkModeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    Темная тема
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

            </Box>
          </Grid>

          <Grid item size={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl component="fieldset">
                  <FormLabel component="legend">Источник данных</FormLabel>
                  <RadioGroup
                    row
                    value={settings.dataSource}
                    onChange={(e) => onSettingsChange('dataSource', e.target.value)}
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
                    onChange={(e) => onSettingsChange('csvPath', e.target.value)} 
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
                    onChange={(e) => onSettingsChange('psScriptPath', e.target.value)} 
                  />
                  <Button variant="outlined" size="small" onClick={() => handleBrowse('ps1')}>Обзор...</Button>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item size={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={settings.showPresetsBlock} 
                      onChange={(e) => onSettingsChange('showPresetsBlock', e.target.checked)}
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
                    <IconButton onClick={() => handleRemovePreset(index)} color="error" size="small" disabled={!settings.showPresetsBlock}><DeleteIcon /></IconButton>
                  </Box>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddPreset} sx={{ mt: 1 }} disabled={!settings.showPresetsBlock}>Добавить</Button>
              </fieldset>
            </Box>
          </Grid>

          <Grid item size={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={settings.showReservedComputersBlock} 
                      onChange={(e) => onSettingsChange('showReservedComputersBlock', e.target.checked)} 
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
                          <TextField label="Название" variant="standard" fullWidth value={reserved.name} onChange={(e) => handleReservedChange(index, 'name', e.target.value)} disabled={!settings.showReservedComputersBlock} />
                          <TextField label="Имя или IP" variant="standard" fullWidth value={reserved.target} onChange={(e) => handleReservedChange(index, 'target', e.target.value)} disabled={!settings.showReservedComputersBlock} />
                          <IconButton onClick={() => handleRemoveReserved(index)} color="error" size="small" disabled={!settings.showReservedComputersBlock}><DeleteIcon /></IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddReserved} sx={{ mt: 1 }} disabled={!settings.showReservedComputersBlock}>Добавить</Button>
              </fieldset>
            </Box>
          </Grid>
        </Grid>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={onSave}>
                Сохранить параметры
            </Button>
        </div>
    </div>
  );
}