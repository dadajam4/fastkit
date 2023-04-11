import * as styles from './VPackageHome.css';
import { defineComponent, computed, PropType } from 'vue';
import {
  VButton,
  VButtonProps,
  VAppBody,
  VAppContainer,
  VGridContainer,
  VGridItem,
  VBusyImage,
  VLink,
} from '@fastkit/vui';
import { PackageProvide } from '@@';
import { useHead } from '@vueuse/head';
import { VLanguageSwitcher } from '~/components';
import { capitalize } from '@fastkit/helpers';

interface Action extends Omit<VButtonProps, 'size'> {
  label: string;
}

export const VPackageHome = defineComponent({
  name: 'VPackageHome',
  props: {
    name: String,
    title: String,
    logo: String,
    description: String,
    github: String,
    actions: {
      type: Array as PropType<Action[]>,
      default: () => [],
    },
    fastkitHome: Boolean,
  },
  setup(props) {
    const pkg = PackageProvide.use(true);

    const nameRef = computed<string>(() => {
      const name = props.name || pkg?.displayName;
      if (!name) {
        throw new Error('PackageProvide or name must be provided.');
      }
      return name
        .split('-')
        .map((word) => capitalize(word))
        .join(' ');
    });

    const titleRef = computed<string>(() => {
      const { title } = props;
      if (title) return title;
      const name = nameRef.value;
      return `${name} | Fastkit`;
    });

    const descriptionRef = computed<string | undefined>(() => {
      const { description } = props;
      if (description) return description;
      return pkg?.description;
    });

    const githubRef = computed<string | undefined>(() => {
      const { github } = props;
      if (github) return github;
      return pkg?.github;
    });

    const actionsRef = computed<Action[]>(() => {
      const actions: Action[] = [...props.actions];
      const github = githubRef.value;
      if (github) {
        actions.push({
          label: 'GitHub',
          color: 'secondary',
          startIcon: 'mdi-github',
          target: '_blank',
          href: github,
        });
      }
      return actions;
    });

    useHead({
      title: titleRef,
    });

    return () => {
      const { logo } = props;
      const description = descriptionRef.value;

      return (
        <VAppBody class={styles.host} center>
          <VAppContainer class="text-center">
            {logo && (
              <VBusyImage
                class="pg-home__logo"
                src={logo}
                alt=""
                width={120}
                height={120}
              />
            )}
            <h1 class={[styles.title, 'docs-theme-font']}>{nameRef.value}</h1>
            {description && <p class={styles.description}>{description}</p>}

            <VLanguageSwitcher class={styles.languages} inline />

            <VGridContainer
              spacing={2}
              alignContent={'center'}
              justifyContent={'center'}>
              {actionsRef.value.map((action, index) => (
                <VGridItem key={index}>
                  <VButton class={styles.action} {...action} size="lg">
                    {action.label}
                  </VButton>
                </VGridItem>
              ))}
            </VGridContainer>

            <div class={styles.powered}>
              <VBusyImage
                class="mr-1"
                src={`${import.meta.env.BASE_URL}logo.svg`}
                width={24}
                height={24}
              />
              {'Powered by '}
              <VLink class="ml-1" to="/">
                Fastkit
              </VLink>
            </div>
          </VAppContainer>
        </VAppBody>
      );
    };
  },
});
