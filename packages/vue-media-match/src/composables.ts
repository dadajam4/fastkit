import { onMounted } from 'vue';
import { getVueMediaMatchService } from './service';

export function useMediaMatch() {
  const service = getVueMediaMatchService();
  if (!service.isBooted()) {
    onMounted(() => {
      service.setup();
    });
  }
  return service;
}
