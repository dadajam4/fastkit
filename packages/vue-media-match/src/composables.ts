import { getVueMediaMatchService } from './service';
import { onMounted } from 'vue';

export function useMediaMatch() {
  const service = getVueMediaMatchService();
  if (!service.isBooted()) {
    onMounted(() => {
      service.setup();
    });
  }
  return service;
}
