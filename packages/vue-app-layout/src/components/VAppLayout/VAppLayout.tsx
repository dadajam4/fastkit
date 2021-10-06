import './VAppLayout.scss';

import {
  PropType,
  renderSlot,
  VNode,
  Transition,
  watch,
  withDirectives,
} from 'vue';
import {
  VAppLayoutControl,
  RawVAppLayoutControlConditionalFn,
  VAppLayoutControlBackdropPosition,
} from './control';
import {
  defineComponentWithSlots,
  bodyScrollLockDirectiveArgument,
} from '@fastkit/vue-utils';
import { useRouter } from 'vue-router';

const VERTICAL_POSITIONS = ['header', 'footer'] as const;

export interface VAppLayoutVertialProps {
  tag?: string;
  fixed?: boolean;
}

export interface VAppLayoutFooterProps extends VAppLayoutVertialProps {
  spacer?: boolean;
}

export interface VAppLayoutBarProps {
  tag?: string;
}

export type VAppLayoutDrawerPosition = 'left' | 'right';

export interface VAppLayoutDrawerProps {
  tag?: string;
  position?: VAppLayoutDrawerPosition;
  stick?: boolean | typeof VERTICAL_POSITIONS[number];
}

export interface VAppLayoutSlotPayload {
  control: VAppLayoutControl;
}

const VAppLayoutConditional = [
  Function,
  Boolean,
] as PropType<RawVAppLayoutControlConditionalFn>;

export const VAppLayout = defineComponentWithSlots({
  name: 'VAppLayout',
  props: {
    header: Object as PropType<VAppLayoutVertialProps>,
    footer: Object as PropType<VAppLayoutFooterProps>,
    headerBar: Object as PropType<VAppLayoutBarProps>,
    footerBar: Object as PropType<VAppLayoutBarProps>,
    drawer: Object as PropType<VAppLayoutDrawerProps>,
    drawerStatic: VAppLayoutConditional,
    viewportTag: String,
  },
  emits: {
    clickBackdrop: (
      ev: MouseEvent,
      position: VAppLayoutControlBackdropPosition,
      control: VAppLayoutControl,
    ) => true,
  },
  _slots: {
    default: (payload: VAppLayoutSlotPayload) => true,
    header: (payload: VAppLayoutSlotPayload) => true,
    footer: (payload: VAppLayoutSlotPayload) => true,
    headerBar: (payload: VAppLayoutSlotPayload) => true,
    footerBar: (payload: VAppLayoutSlotPayload) => true,
    drawer: (payload: VAppLayoutSlotPayload) => true,
  },
  setup(props) {
    const control = new VAppLayoutControl(props);

    const router = useRouter();

    router.afterEach(() => {
      control.closeDrawer();
    });

    control.requestBackdrop('drawer', () => {
      return !control.drawerIsStatic && control.drawerActive;
    });

    control.onClickBackdrop((ev, position) => {
      if (position === 'drawer') {
        control.closeDrawer();
      }
    });

    watch(control.computedDrawerIsStatic, () => {
      control.closeDrawer();
    });

    return {
      control,
    };
  },
  render() {
    const { $slots, control } = this;
    const ViewportTag = (this.viewportTag || 'div') as 'div';
    const slotPayload: VAppLayoutSlotPayload = { control };
    const _default = renderSlot($slots, 'default');

    const classes = ['v-app-layout'];

    if (control.drawerIsStatic) {
      classes.push('v-app-layout--drawer-static');
    }

    const contents: {
      header?: VNode;
      footer?: VNode;
      headerBar?: VNode;
      footerBar?: VNode;
      drawer?: VNode;
    } = {};

    VERTICAL_POSITIONS.forEach((position) => {
      const vertialSlot = $slots[position];
      if (!vertialSlot) return;
      const vertialChildren = vertialSlot(slotPayload);
      if (!vertialChildren.length) return;
      classes.push(`v-app-layout--has-${position}`);
      const vertialProps: VAppLayoutVertialProps | VAppLayoutFooterProps =
        this[position] || {};
      const TagName = (vertialProps.tag || 'div') as 'div';
      const { fixed } = vertialProps;
      const vertialClasses = [`v-app-layout__${position}`];
      if ('spacer' in vertialProps && vertialProps.spacer) {
        vertialClasses.push(`v-app-layout__${position}--spacer`);
      }
      if (fixed) {
        vertialClasses.push(`v-app-layout__${position}--fixed`);
        classes.push(`v-app-layout--has-fixed-${position}`);
      }
      contents[position] = (
        <TagName class={vertialClasses}>{vertialChildren}</TagName>
      );
    });

    VERTICAL_POSITIONS.forEach((position) => {
      const key = `${position}Bar` as const;
      const barSlot = $slots[key];
      if (!barSlot) return;
      const barChildren = barSlot(slotPayload);
      if (!barChildren.length) return;
      classes.push(`v-app-layout--has-${position}-bar`);
      const barProps = this[key] || {};
      const TagName = (barProps.tag || 'div') as 'div';
      const barClasses = [`v-app-layout__${position}-bar`];
      contents[key] = <TagName class={barClasses}>{barChildren}</TagName>;
    });

    const drawerSlot = $slots.drawer;
    if (drawerSlot) {
      const drawerChildren = drawerSlot();
      if (drawerChildren.length) {
        classes.push(`v-app-layout--has-drawer`);
        const drawerProps = this.drawer || {};
        const TagName = (drawerProps.tag || 'div') as 'div';
        const { position = 'left', stick } = drawerProps;
        if (stick) {
          const stickPoints: typeof VERTICAL_POSITIONS[number][] =
            typeof stick === 'string' ? [stick] : ['header', 'footer'];
          classes.push(
            ...stickPoints.map(
              (point) => `v-app-layout--drawer-stick-${point}`,
            ),
          );
        }
        classes.push(`v-app-layout--drawer-${position}`);
        const drawerClasses = [`v-app-layout__drawer`];
        contents.drawer = (
          <>
            <Transition name="v-app-layout__drawer">
              <TagName
                class={drawerClasses}
                v-show={control.drawerIsStatic || control.drawerActive}>
                {drawerChildren}
              </TagName>
            </Transition>
          </>
        );
      }
    }

    const { headerBar, header, drawer, footer, footerBar } = contents;

    <div class="v-app-viewport">{renderSlot(this.$slots, 'default')}</div>;

    if (control.drawerActive) {
      classes.push('v-app-layout--drawer-active');
    }

    const activeBackdrop = control.activeBackdrop;

    const backdrops = VAppLayoutControl.BACKDROP_POSITIONS.map((position) => {
      return (
        <Transition name="v-app-layout__backdrop" key={`backdrop-${position}`}>
          {activeBackdrop === position &&
            withDirectives(
              <div
                class={[
                  'v-app-layout__backdrop',
                  `v-app-layout__backdrop--${position}`,
                ]}
                onClick={(ev) => {
                  const result = control.emitClickBackdrop(ev, position);
                  if (result !== false) {
                    this.$emit('clickBackdrop', ev, position, control);
                  }
                }}
              />,
              [bodyScrollLockDirectiveArgument(true)],
            )}
        </Transition>
      );
    });

    return (
      <div class={classes}>
        {backdrops}
        {header}
        <ViewportTag class="v-app-layout__viewport">{_default}</ViewportTag>
        {drawer}
        {footer}
        {headerBar}
        {footerBar}
      </div>
    );
  },
});
