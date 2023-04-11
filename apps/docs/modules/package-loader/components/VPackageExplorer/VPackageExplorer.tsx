import './VPackageExplorer.scss';

import { defineComponent, PropType, computed } from 'vue';
import { PackageInfo } from '../../schemes';
import { useVuePageControl } from '@fastkit/vot';
import {
  VDataTable,
  DataTableHeader,
  VSelect,
  FormSelectorItem,
  useVui,
  VLink,
} from '@fastkit/vui';
import { PackageExploerI18nSpace, FilterInfo } from './i18n';
import { i18n } from '@@/i18n';
import { inNonNullable } from '@fastkit/helpers';

const DEFAULT_SCOPE = 'anywhere';

const DEFAULT_FEATURE = 'general';

type FilterQuery = 'scope' | 'feature';

interface FilterContext {
  readonly items: FormSelectorItem[];
  value: string[];
}

const extractStrings = <
  Key extends string,
  Obj extends { [K in Key]?: string },
>(
  key: Key,
  rows: Obj[],
  defaultValue: string,
): string[] => {
  const results: string[] = [];
  rows.forEach((obj) => {
    const str = obj[key] || defaultValue;
    if (!results.includes(str)) results.push(str);
  });
  results.sort((a, b) => {
    if (a === b) return 0;
    if (a === defaultValue) return -1;
    if (b === defaultValue) return 1;
    return 0;
  });

  return results;
};

export const VPackageExplorer = defineComponent({
  name: 'VPackageExplorer',
  i18n: PackageExploerI18nSpace,
  props: {
    value: {
      type: Array as PropType<PackageInfo[]>,
      required: true,
    },
  },
  setup(props) {
    const vpc = useVuePageControl();
    const vui = useVui();
    const { trans } = i18n.use().at.common;
    const { trans: _trans } = PackageExploerI18nSpace.use().at.PackageExploer;

    const getFilterInfo = (type: FilterQuery, value: string): FilterInfo => {
      const info = _trans[`${type}s`][value];
      if (info) return info;
      return {
        name: value,
      };
    };

    const getFilterLabel = (type: FilterQuery, value: string) => {
      const info = getFilterInfo(type, value);
      return () => (
        <div class="v-package-explorer__filter__selection-item">
          <div class="v-package-explorer__filter__selection-item__name">
            {info.name}
          </div>
          {!!info.description && (
            <small class="v-package-explorer__filter__selection-item__description">
              {info.description}
            </small>
          )}
        </div>
      );
    };

    const scopesRef = computed<string[]>(() =>
      extractStrings('scope', props.value, DEFAULT_SCOPE),
    );

    const scopeItemsRef = computed<FormSelectorItem[]>(() =>
      scopesRef.value.map((value) => ({
        value,
        label: getFilterLabel('scope', value),
      })),
    );

    const featuresRef = computed<string[]>(() =>
      extractStrings('feature', props.value, DEFAULT_FEATURE),
    );

    const featureItemsRef = computed<FormSelectorItem[]>(() =>
      featuresRef.value.map((value) => ({
        value,
        label: getFilterLabel('feature', value),
      })),
    );

    const getFilterValuesFromRouteQuery = (type: FilterQuery): string[] => {
      const value = vpc.route.query[type];
      if (!value) return [];
      const chunks = Array.isArray(value) ? value : [value];
      const filtered = chunks.filter(inNonNullable);
      const results: string[] = [];
      filtered.forEach((row) => {
        results.push(...row.split(','));
      });
      return Array.from(new Set(results));
    };

    const setFilterValuesForRouteQuery = (
      type: FilterQuery,
      values: string[],
    ) => {
      const value = values.length ? values.join(',') : null;
      vui.location.pushQuery({
        [type]: value,
      });
    };

    const filterContexts: Record<FilterQuery, FilterContext> = {
      scope: {
        get items() {
          return scopeItemsRef.value;
        },
        get value() {
          return getFilterValuesFromRouteQuery('scope');
        },
        set value(value) {
          setFilterValuesForRouteQuery('scope', value);
        },
      },
      feature: {
        get items() {
          return featureItemsRef.value;
        },
        get value() {
          return getFilterValuesFromRouteQuery('feature');
        },
        set value(value) {
          setFilterValuesForRouteQuery('feature', value);
        },
      },
    };

    const createFilterItem = (type: FilterQuery) => {
      const ctx = filterContexts[type];
      return (
        <VSelect
          key={type}
          class="v-package-explorer__filter__item"
          label={_trans.header[type]}
          items={ctx.items}
          multiple
          clearable
          closeOnNavigation={false}
          placeholder={trans.all}
          v-model={ctx.value}
          v-slots={{
            selection: ({ item }) => {
              const info = getFilterInfo(type, item.propValue as any);
              return info.name;
            },
          }}
        />
      );
    };

    const packagesRef = computed(() =>
      props.value.map((pkg) => {
        const { currentLocaleName } = vpc.i18n;

        return {
          ...pkg,
          description: pkg.description[currentLocaleName],
        };
      }),
    );

    const filteredPackagesRef = computed(() => {
      const scopeFilterValues = filterContexts.scope.value;
      const featureFilterValues = filterContexts.feature.value;
      return packagesRef.value.filter(({ scope, feature }) => {
        scope = scope || DEFAULT_SCOPE;
        feature = feature || DEFAULT_FEATURE;

        if (scopeFilterValues.length && !scopeFilterValues.includes(scope))
          return false;
        if (
          featureFilterValues.length &&
          !featureFilterValues.includes(feature)
        )
          return false;
        return true;
      });
    });

    const sortedPackagesRef = computed(() => {
      const results = filteredPackagesRef.value.slice();
      const { sort, order } = vpc.route.query;
      if (typeof sort !== 'string' || typeof order !== 'string') return results;
      const isDesc = order === 'DESC';
      const vec = isDesc ? -1 : 1;
      results.sort((a, b) => {
        const av = (a as any)[sort];
        const bv = (b as any)[sort];
        if (av < bv) return -1 * vec;
        if (av > bv) return 1 * vec;
        return 0;
      });
      return results;
    });

    const headers: DataTableHeader[] = [
      {
        key: 'name',
        label: () => _trans.header.name,
        cell: (payload) => (
          <VLink to={`/${payload.item.name}/`}>{payload.item.name}</VLink>
        ),
        sortQuery: 'name',
      },
      {
        key: 'scope',
        label: () => _trans.header.scope,
        cell: (payload) => {
          const value = payload.item.scope;
          if (!value) return;
          const info = getFilterInfo('scope', value);
          return info.name;
        },
        sortQuery: 'scope',
      },
      {
        key: 'feature',
        label: () => _trans.header.feature,
        cell: (payload) => {
          const value = payload.item.feature;
          if (!value) return;
          const info = getFilterInfo('feature', value);
          return info.name;
        },
        sortQuery: 'feature',
      },
      {
        key: 'description',
        label: () => _trans.header.description,
        cell: (payload) => payload.item.description,
      },
    ];

    return () => {
      const packages = sortedPackagesRef.value;

      return (
        <div class="v-package-explorer">
          <div class="v-package-explorer__filter">
            {createFilterItem('scope')}
            {createFilterItem('feature')}
          </div>

          {packages.length > 0 && (
            <div class="v-package-explorer__count">
              <span class="v-package-explorer__count__num">
                {props.value.length}
              </span>
              <span>個中</span>
              <span class="v-package-explorer__count__num">
                {packages.length}
              </span>
              <span>個のパッケージ</span>
            </div>
          )}

          <VDataTable
            headers={headers}
            items={packages}
            fixedHeader
            itemKey="name"
            limits={[]}
          />
        </div>
      );
    };
  },
});
