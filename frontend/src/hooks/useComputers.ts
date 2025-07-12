import { api } from '../api';
import type { Computer } from '../types';
import { useState, useEffect, useCallback } from 'react';


export function useComputers() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading]     = useState(false);

  const fetchComputers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getComputers();
      setComputers(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке списка компьютеров:", error);
      setComputers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Первичная загрузка и установка интервала
  useEffect(() => {
    fetchComputers();
    const interval = setInterval(fetchComputers, 300_000); // 5 минут
    return () => clearInterval(interval);
  }, [fetchComputers]);
  
  return { computers, loading, fetchComputers };
}