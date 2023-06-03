import postcss, { Plugin, Root, Container, Rule } from 'postcss';

export type RuleFilter = string | RegExp;

export type RuleSpecFn = (rule: Rule) => boolean;

export type RuleSpec = RuleFilter[] | RuleSpecFn;

export interface CombineRulesOptions {
  rules: RuleSpec;
}

function buildFilterFn(spec: RuleSpec): RuleSpecFn {
  return (rule) => {
    if (typeof spec === 'function') return spec(rule);
    const { selector } = rule;
    return spec.some((target) => {
      if (typeof target === 'string') return selector === target;
      return target.test(selector);
    });
  };
}

export function combineContainerRules(
  container: Container,
  filter: RuleSpecFn,
) {
  const { nodes } = container;
  if (!nodes) return;

  const rules: Rule[] = (nodes as Rule[]).filter(filter);
  const combinedRules: { selector: string; rules: Rule[]; container: Rule }[] =
    [];
  rules.forEach((rule) => {
    const { selector } = rule;
    let combinedRule = combinedRules.find((c) => c.selector === selector);
    if (!combinedRule) {
      combinedRule = {
        selector,
        rules: [],
        container: rule,
      };
      combinedRules.push(combinedRule);
    }
    combinedRule.rules.push(rule);
  });

  combinedRules.forEach((combinedRule) => {
    combinedRule.rules.forEach((rule, index) => {
      if (index === 0) return;
      const { nodes } = rule;
      if (!nodes) return;
      nodes.forEach((node) => {
        combinedRule.container.append(node.clone());
      });
      rule.remove();
    });
  });
}

export function combineRules(
  css: string | { toString(): string } | Root,
  opts: CombineRulesOptions,
): Root {
  const root = css instanceof Root ? css : postcss.parse(css);
  const filter = buildFilterFn(opts.rules);
  combineContainerRules(root, filter);
  root.walkAtRules((atRule) => {
    combineContainerRules(atRule, filter);
  });
  return root;
}

const PLUGIN_NAME = 'combine-rules';

export function CombineRules(opts: CombineRulesOptions): Plugin {
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      combineRules(root, opts);
    },
  };
}

CombineRules.postcss = true;

export default CombineRules;
