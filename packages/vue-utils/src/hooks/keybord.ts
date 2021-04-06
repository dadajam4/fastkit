import { onBeforeMount, onBeforeUnmount } from 'vue';
import { Key, RawKBSettings, KeybordService } from '@fastkit/keybord';

export type UseKeybordSettings = RawKBSettings;

export interface UseKeybordOptions {
  autorun?: boolean;
}

export interface UseKeybordRef {
  readonly run: () => void;
  readonly stop: () => void;
}

export interface UseKeybord {
  (settings: UseKeybordSettings): UseKeybordRef;
  Key: typeof Key;
}

export const useKeybord: UseKeybord = function useKeybord(
  settings: UseKeybordSettings,
  options: UseKeybordOptions = {},
): UseKeybordRef {
  const keybord = new KeybordService(settings);

  function run() {
    return keybord.run();
  }

  function stop() {
    return keybord.stop();
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

useKeybord.Key = Key;
