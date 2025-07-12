import type { ReservedComputer } from '../types';

import {
  Grid,
  Button,
  Divider,
  IconButton,
  ButtonGroup
} from '@mui/material';
import {
  Folder as FolderIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
interface ReservedPanelProps {
  computers: ReservedComputer[];
  onConnect: (target: string) => void;
  onOpenFolder: (target: string) => void;
  onPing: (target: string) => void;
}

export function ReservedPanel({ computers, onConnect, onOpenFolder, onPing }: ReservedPanelProps) {
  return (
    <div className="rightBlock">
      <h3>Зарезервированные компьютеры</h3>
      <div className="input-wrapper">
        <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
          {computers.map((reserved, index) => (
            <Grid size={{ xs: 12, md: 5.7 }} key={reserved.name + index}>
              <ButtonGroup variant="contained" sx={{ width: '27ch' }}>
                <Button
                  title={`Подключиться к ${reserved.target}`}
                  onClick={() => onConnect(reserved.target)}
                  disabled={!reserved.target}
                  sx={{ flexGrow: 1 }}
                >
                  {reserved.name}
                </Button>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton
                  title={`Открыть папку ${reserved.target}`}
                  color='primary'
                  disabled={!reserved.target}
                  onClick={() => onOpenFolder(reserved.target)}
                >
                  <FolderIcon />
                </IconButton>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton
                  title={`Ping ${reserved.target}`}
                  color='primary'
                  disabled={!reserved.target}
                  onClick={() => onPing(reserved.target)}
                >
                  <TerminalIcon />
                </IconButton>
              </ButtonGroup>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}