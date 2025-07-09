import React from 'react';
import { 
  Paper, 
  Divider, 
  InputBase, 
  IconButton 
} from '@mui/material';
import {
  Clear as ClearIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  Terminal as TerminalIcon,
  KeyboardReturn as KeyboardReturnIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

interface ControlsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  loading: boolean;
  onRefresh: () => void;
  quickConnect: string;
  onQuickConnectChange: (value: string) => void;
  onConnect: (target: string) => void;
  onOpenFolder: (target: string) => void;
  onPing: (target: string) => void;
}

const handleValidatedInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.replace(/[^a-zA-Zа-яА-Я0-9\-_.\sҚқІіҢңҒғҮүҰұӨөҺһ]/g, ''));
};

export function Controls({
  searchTerm, onSearchTermChange, loading, onRefresh, quickConnect,
  onQuickConnectChange, onConnect, onOpenFolder, onPing
}: ControlsProps) {
  return (
    <div className="controls">
      <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 500 }}>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Поиск по ФИО или имени ПК"
          value={searchTerm}
          onChange={handleValidatedInput(onSearchTermChange)}
          autoComplete="off"
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton 
            title='Очистить поле' 
            color="error" 
            sx={{ p: '10px' }} 
            disabled={!searchTerm} 
            onClick={() => onSearchTermChange('')}
        >
          <ClearIcon />
        </IconButton>
      </Paper>

      <LoadingButton 
        loading={loading} 
        loadingPosition="start" 
        startIcon={<RefreshIcon />} 
        variant="standard" 
        onClick={onRefresh}
      >
        Обновить список
      </LoadingButton>

      <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Имя или IP"
          value={quickConnect}
          onChange={handleValidatedInput(onQuickConnectChange)}
          onKeyDown={(e) => { if (e.key === 'Enter' && quickConnect) { e.preventDefault(); onConnect(quickConnect); }}}
          autoComplete="off"
        />
        <IconButton 
            title='Подключиться' 
            type="button" 
            sx={{ p: '10px' }} 
            color='primary' 
            disabled={!quickConnect} 
            onClick={() => onConnect(quickConnect)}
        >
          <KeyboardReturnIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton 
            title='Открыть локальную папку' 
            type="button" 
            sx={{ p: '10px' }} 
            color='primary' 
            disabled={!quickConnect} 
            onClick={() => onOpenFolder(quickConnect)}
        >
          <FolderIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton 
            title='Ping' 
            type="button" 
            sx={{ p: '10px' }} 
            color='primary' 
            disabled={!quickConnect} 
            onClick={() => onPing(quickConnect)}
        >
          <TerminalIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton 
            title='Очистить поле' 
            color="error" 
            sx={{ p: '10px' }} 
            disabled={!quickConnect} 
            onClick={() => onQuickConnectChange('')}
        >
          <ClearIcon />
        </IconButton>
      </Paper>
    </div>
  );
}