import type { Computer } from '../types';

interface ComputerListProps {
  computers: Computer[];
  loading: boolean;
  onConnect: (target: string) => void;
}

export function ComputerList({ computers, loading, onConnect }: ComputerListProps) {
  return (
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
          ) : computers.length > 0 ? (
            computers.map((c, i) => (
              <tr key={i}>
                <td className="td">{c.fio}</td>
                <td className="td">{c.name}</td>
                <td className="td">
                  <button onClick={() => onConnect(c.name)} className="button">Подключиться</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={3} className="noResults">Ничего не найдено</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}