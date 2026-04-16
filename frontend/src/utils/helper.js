import { format } from 'date-fns';

// export function formatDate(dateStr) {
//   const d = new Date(dateStr + 'T00:00:00');
//   return d.toLocaleDateString('vi-VN');
// }

export function formatDate(dateStr) {
 return format(new Date(dateStr), 'dd/MM/yyyy');
}