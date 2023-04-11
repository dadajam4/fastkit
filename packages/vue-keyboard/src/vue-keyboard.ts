import { onBeforeMount, onBeforeUnmount } from 'vue';
import { Key, RawKBSettings, KeyboardService } from '@fastkit/keyboard';

export type UseKeyboardSettings = RawKBSettings;

export interface UseKeyboardOptions {
  autorun?: boolean;
}

export interface UseKeyboardRef {
  readonly run: () => void;
  readonly stop: () => void;
}

export interface UseKeyboard {
  (settings: UseKeyboardSettings, options?: UseKeyboardOptions): UseKeyboardRef;
  Key: typeof Key;
}

export const useKeyboard: UseKeyboard = function useKeyboard(
  settings: UseKeyboardSettings,
  options: UseKeyboardOptions = {},
): UseKeyboardRef {
  const keyboard = new KeyboardService(settings);

  function run() {
    return keyboard.run();
  }

  function stop() {
    return keyboard.stop();
  }

  if (options.autorun) {
    onBeforeMount(run);
  }

  onBeforeUnmount(stop);

  return {
    run,
    stop,
  };
};

useKeyboard.Key = Key;
