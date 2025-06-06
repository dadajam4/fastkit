import './VSelect.scss';
import {
  ref,
  Ref,
  VNodeChild,
  defineComponent,
  PropType,
  computed,
  nextTick,
} from 'vue';
import {
  createFormSelectorSettings,
  useFormSelectorControl,
  createFormNodeWrapperProps,
  FormNodeWrapperSlots,
  FormSelectorItemControl,
} from '@fastkit/vue-form-control';
import {
  defineSlots,
  createPropsOptions,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  withCtxForSlots,
  withCtx,
} from '@fastkit/vue-utils';
import { useKeyboard } from '@fastkit/vue-keyboard';
import { VStackActivatorPayload, MenuAPI } from '@fastkit/vue-stack';
import { VFormControl } from '../VFormControl';
import {
  VControlField,
  createControlFieldProps,
  InputBoxSlots,
} from '../VControlField';
import {
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
} from '../../composables';
import { VUI_SELECT_SYMBOL, useVui } from '../../injections';
import { VIcon } from '../VIcon';
import { VMenu } from '../VMenu';
import { VOptionGroup } from '../VOptionGroup';
import { VOption } from '../VOption';
import { VButton } from '../VButton';

export const ARROW_KEY_TYPES = useKeyboard.Key(['ArrowUp', 'ArrowDown']);

export const CHOICE_KEY_TYPES = useKeyboard.Key(['Enter', ' ']);

export const KEYBOARD_EVENT_TYPES = useKeyboard.Key([
  ...ARROW_KEY_TYPES,
  ...CHOICE_KEY_TYPES,
]);

const { props, emits } = createFormSelectorSettings({
  defaultValidateTiming: 'blur',
});

const slots = defineSlots<
  FormNodeWrapperSlots &
    InputBoxSlots & {
      selection?: (ctx: {
        item: FormSelectorItemControl;
        index: number;
      }) => any;
    }
>();

export const VSelect = defineComponent({
  name: 'VSelect',
  props: {
    ...props,
    ...createFormNodeWrapperProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...slots(),
    ...createPropsOptions({
      placeholder: String,
      loadingMessage: {} as PropType<VNodeChildOrSlot>,
      failedToLoadItemsMessage: {} as PropType<VNodeChildOrSlot>,
    }),
    closeOnNavigation: Boolean,
  },
  slots,
  emits,
  // eslint-disable-next-line no-shadow
  setup(props, ctx) {
    const menuRef: Ref<{ menu: MenuAPI } | null> = ref(null);
    const menuOpened = ref(false);
    const showMenu = () => {
      menuOpened.value = true;
    };
    const closeMenu = () => {
      menuOpened.value = false;
    };
    const inputControl = useFormSelectorControl(props, ctx, {
      nodeType: VUI_SELECT_SYMBOL,
      onSelectItem: (item) => {
        closeMenu();
      },
    });
    const control = useControl(props);
    useControlField(props);
    const vui = useVui();
    const iconName = vui.icon('menuDown');
    const fieldRef = ref<HTMLElement | null>(null);
    const loadingMessageRef = computed(() => {
      const slot = resolveVNodeChildOrSlots(
        props.loadingMessage,
        vui.setting('loadingMessage'),
        'Loading...',
      );
      return slot && slot(vui);
    });
    const failedToLoadItemsMessageRef = computed(() => {
      const slot = resolveVNodeChildOrSlots(
        props.failedToLoadItemsMessage,
        vui.setting('failedToLoadDataMessage'),
        'Failed to load data.',
      );
      return slot && slot(vui);
    });

    const focus = (opts?: FocusOptions): void => {
      fieldRef.value?.focus?.(opts);
    };

    const renderSelections = (selectedItems: FormSelectorItemControl[]) => {
      const selectionSlot = ctx.slots.selection;
      const children: VNodeChild[] = [];
      if (inputControl.itemsLoadFailed) {
        children.push(
          <span class="v-select__placeholder">
            {failedToLoadItemsMessageRef.value}
          </span>,
        );
      } else if (inputControl.itemsLoading) {
        children.push(
          <span class="v-select__placeholder">{loadingMessageRef.value}</span>,
        );
      } else if (selectedItems.length) {
        selectedItems.forEach((item, index) => {
          if (index > 0) {
            children.push(vui.selectionSeparator());
          }
          const child = selectionSlot
            ? selectionSlot({ item, index })
            : item.renderDefaultSlot();
          children.push(child);
        });
      } else if (props.placeholder != null) {
        children.push(
          <span class="v-select__placeholder">{props.placeholder}</span>,
        );
      }

      return children;
    };

    const clearKeyFocused = () => {
      const menu = menuRef.value?.menu;
      if (!menu) return;
      const bodyEl = menu.bodyRef.value;
      if (!bodyEl) return;

      const els = Array.from(
        bodyEl.querySelectorAll('.v-option'),
      ) as HTMLElement[];

      els.forEach((el) => el.classList.remove('v-option--key-focused'));
    };

    const getItemElements = (): HTMLElement[] | void => {
      const menu = menuRef.value?.menu;
      if (!menu) return;

      const bodyEl = menu.bodyRef.value;

      if (!bodyEl) return;

      const els = (
        Array.from(bodyEl.querySelectorAll('.v-option')) as HTMLElement[]
      ).filter((el) => {
        if (el.tabIndex === -1) return false;
        const disabled = el.getAttribute('disabled');
        const ariaDisabled = el.getAttribute('aria-disabled');
        if (ariaDisabled === 'true') return false;
        return disabled == null || disabled === '';
      });

      if (!els.length) return;

      return els;
    };

    const arrowKeyHandler = (ev: KeyboardEvent) => {
      const { key } = ev;
      if (!menuOpened.value || !ARROW_KEY_TYPES.includes(key as any)) return;

      const els = getItemElements();

      if (!els) return;

      const currentEl = els.find((el) =>
        el.classList.contains('v-option--key-focused'),
      );
      const currentIndex = currentEl && els.indexOf(currentEl);
      let nextIndex: number;
      const { length } = els;
      const isUp = key === 'ArrowUp';
      if (currentIndex == null) {
        nextIndex = isUp ? length - 1 : 0;
      } else {
        const shiftAmount = key === 'ArrowUp' ? -1 : 1;
        nextIndex = currentIndex + shiftAmount;
        if (nextIndex < 0) {
          nextIndex = length - 1;
        } else if (nextIndex >= length) {
          nextIndex = 0;
        }
      }

      const nextEl = els[nextIndex];

      if (nextEl) {
        clearKeyFocused();
        nextEl.classList.add('v-option--key-focused');
        nextEl.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'smooth',
        });
        ev.preventDefault();
      }
    };

    const choiceKeyHandler = (ev: KeyboardEvent) => {
      const { key } = ev;
      if (!menuOpened.value || !CHOICE_KEY_TYPES.includes(key as any)) return;

      const els = getItemElements();

      if (!els) return;

      const currentEl = els.find((el) =>
        el.classList.contains('v-option--key-focused'),
      );

      if (currentEl) {
        // eslint-disable-next-line no-shadow
        const ev = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        currentEl.dispatchEvent(ev);
        ev.preventDefault();
        nextTick(() => {
          currentEl.classList.add('v-option--key-focused');
        });
      }
    };

    const keyboardEventHandler = (ev: KeyboardEvent) => {
      if (ARROW_KEY_TYPES.includes(ev.key as any)) return arrowKeyHandler(ev);
      if (CHOICE_KEY_TYPES.includes(ev.key as any)) return choiceKeyHandler(ev);
    };

    useKeyboard(
      [
        {
          key: KEYBOARD_EVENT_TYPES,
          handler: keyboardEventHandler,
        },
      ],
      { autorun: true },
    );

    ctx.expose({
      control: inputControl,
      focus,
      showMenu,
      closeMenu,
    });

    const handleClickLabel = (ev: MouseEvent) => {
      focus();
    };

    return () => {
      const children = ctx.slots.default?.() || [];
      const propGroups = inputControl.propGroups.map((group) => (
        <VOptionGroup
          key={group.id}
          groupId={group.id}
          label={group.label(inputControl)}
          disabled={group.disabled}>
          {group.items.map((item) => (
            <VOption
              disabled={item.disabled}
              value={item.value}
              key={item.value}>
              {item.label(inputControl)}
            </VOption>
          ))}
        </VOptionGroup>
      ));

      const classes = computed(() => [
        'v-select',
        control.classes.value,
        {
          'v-select--multiple': inputControl.multiple,
        },
      ]);

      const controlDefaultSlot = () => [
        <select
          class="v-select__input__element"
          name={inputControl.name}
          tabindex={inputControl.tabindex}
          disabled={inputControl.isDisabled}
          multiple={inputControl.multiple}
          onFocus={inputControl.focusHandler}
          onBlur={inputControl.blurHandler}
          v-model={inputControl.value}>
          {inputControl.items.map((item) => (
            <option value={item.propValue} key={item.propValue}>
              {item.renderDefaultSlot()}
            </option>
          ))}
        </select>,
        <div class="v-select__selections">
          <div class="v-select__selections__inner">
            {renderSelections(inputControl.selectedItems)}
          </div>
        </div>,
      ];

      const endAdornmentSlot = () => {
        if (inputControl.itemsLoadFailed) {
          return (
            <VButton
              key="reload"
              icon={vui.icon('reload')}
              rounded
              onClick={(ev) => {
                ev.stopPropagation();
                inputControl.loadItems();
              }}
            />
          );
        }

        if (props.clearable && inputControl.value != null) {
          return (
            <VButton
              key="clear"
              icon={vui.icon('clear')}
              rounded
              onClick={(ev) => {
                ev.stopPropagation();
                inputControl.clear();
              }}
            />
          );
        }

        return (
          <VIcon
            key="icon"
            name={iconName}
            rotate={menuOpened.value ? 180 : 0}
          />
        );
      };

      const menuActivatorSlot = ({ control: menu }: VStackActivatorPayload) => (
        <VControlField
          class="v-select__input"
          ref={fieldRef}
          loading={inputControl.itemsLoading}
          error={inputControl.itemsLoadFailed}
          startAdornment={props.startAdornment}
          endAdornment={props.endAdornment}
          size={control.size.value}
          focused={menuOpened.value}
          autoHeight={inputControl.multiple}
          onClick={(ev) => {
            if (inputControl.canOperation && !menu.isActive) {
              let t = ev.target as HTMLElement;
              const count = 0;
              let hit = false;
              while (count < 5) {
                if (t.classList.contains('v-select__input')) {
                  hit = true;
                  break;
                }
                t = t.parentElement as HTMLElement;
              }
              menu.setActivator(hit ? t : ev).show();
            }
          }}
          v-slots={{
            ...ctx.slots,
            default: withCtx(controlDefaultSlot),
            endAdornment: withCtx(endAdornmentSlot),
          }}
        />
      );

      const menuSlots = {
        activator: menuActivatorSlot,
        default: () => (
          <div class={['v-select__body', control.classes.value]}>
            {children}
            {propGroups}
          </div>
        ),
      };

      const defaultSlot = () => (
        <VMenu
          width="fit"
          maxWidth="fit"
          closeOnNavigation={props.closeOnNavigation}
          distance={0}
          alwaysRender
          v-model={menuOpened.value}
          ref={menuRef}
          onClose={clearKeyFocused}
          v-slots={withCtxForSlots(menuSlots)}
        />
      );

      return (
        <VFormControl
          nodeControl={inputControl}
          class={classes.value}
          label={props.label}
          hint={props.hint}
          hinttip={props.hinttip}
          hiddenInfo={props.hiddenInfo}
          requiredChip={props.requiredChip}
          onClickLabel={handleClickLabel}
          v-slots={{
            ...ctx.slots,
            default: withCtx(defaultSlot),
          }}
        />
      );
    };
  },
});
