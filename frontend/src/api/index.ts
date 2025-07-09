import axios from 'axios';
import type { Settings } from '../types';
import type { Computer } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

export const api = {
  getComputers: () => apiClient.get<Computer[]>('/computers'),

  getSettings:  () => apiClient.get<Settings>('/settings'),

  saveSettings: (settings: Settings) => apiClient.post('/settings', settings),

  launchRdp:    (ip: string) => apiClient.get('/launch', { params: { ip } }),

  pingTarget:   (target: string) => apiClient.get('/ping', { params: { target } }),

  openFolder:   (target: string) => apiClient.get('/open-folder', { params: { target } }),

  browseFile:   (fileType: 'exe' | 'csv' | 'ps1') => 
    apiClient.get<{ path: string }>('/browse-file', { params: { file_type: fileType } }),
};