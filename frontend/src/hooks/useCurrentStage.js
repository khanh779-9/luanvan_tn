// Hook lấy giai đoạn hiện tại (dựa vào ngày hệ thống)
import { useQuery } from '@tanstack/react-query';
import { getCurrentStage } from '../services/giaiDoanService';

export function useCurrentStage() {
  const { data, isLoading } = useQuery({
    queryKey: ['giaiDoanCurrent'],
    queryFn: getCurrentStage,
  });

  // API /giai-doan/current trả về trực tiếp object giai đoạn hoặc null
  if (isLoading) return { stage: null, isLoading: true };

  return { stage: data || null, isLoading: false };
}
