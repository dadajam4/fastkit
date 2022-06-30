import './Linter.scss';

import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import {
  WysiwygLinterPlugin,
  WysiwygLinterResult as Issue,
  WysiwygLinterFixMessage,
} from './LinterPlugin';
import { EditorView } from 'prosemirror-view';
import { createWysiwygExtension } from '../../schemes';

const PROBLEM_CLASS_NAME = 'v-linter__problem';
const ISSUE_ICON_CLASS_NAME = 'v-linter__issue-icon';
const ISSUE_DATASET_NAME = 'data-issue-id';

function resolveWysiwygLinterFixMessage(message: WysiwygLinterFixMessage) {
  return typeof message === 'function' ? message() : message;
}

function renderIcon(view: EditorView, issue: Issue) {
  const { level = 'warning' } = issue;
  const icon = document.createElement('div');
  const message = resolveWysiwygLinterFixMessage(issue.message);

  icon.className = `${ISSUE_ICON_CLASS_NAME} ${level}-scope`;
  icon.setAttribute(ISSUE_DATASET_NAME, issue.id);

  if (typeof message === 'string') {
    icon.title = message;
  }

  return icon;
}

function runAllLinterPlugins(
  doc: ProsemirrorNode,
  plugins: Array<typeof WysiwygLinterPlugin>,
) {
  const decorations: [any?] = [];

  const issues = plugins
    .map((RegisteredLinterPlugin) => {
      return new RegisteredLinterPlugin(doc).scan().getResults();
    })
    .flat();

  issues.forEach((issue) => {
    const { level = 'warning', icon } = issue;
    const message = resolveWysiwygLinterFixMessage(issue.message);
    decorations.push(
      Decoration.inline(issue.from, issue.to, {
        class: `${PROBLEM_CLASS_NAME} ${level}-scope`,
        'data-issue-id': issue.id,
        title: typeof message === 'string' ? message : undefined,
      }),
    );
    if (icon) {
      decorations.push(
        Decoration.widget(issue.from, (view) => renderIcon(view, issue)),
      );
    }
  });

  const decorationSet = DecorationSet.create(doc, decorations);

  return {
    issues,
    decorationSet,
  };
}

export interface WysiwygLinterOptions {
  plugins: Array<typeof WysiwygLinterPlugin>;
}

export interface WysiwygLinterStorage {
  issues: Issue[];
}

export const WysiwygLinter = createWysiwygExtension((ctx) => {
  function showMenu(view: EditorView, issue: Issue, event: Event) {
    const message = resolveWysiwygLinterFixMessage(issue.message);
    const variant = ctx.vui.setting('containedVariant');
    const scope = ctx.vui.setting(`${issue.level}Scope`);

    return ctx.vui.menu({
      activator: event,
      content: (stack) => (
        <div class="v-linter__issue-menu__body">
          <div
            class={[
              'v-linter__issue-menu__message',
              `${scope}-scope ${variant}`,
            ]}>
            {message}
          </div>
          {issue.fix.length && (
            <div class="v-linter__issue-menu__fixers">
              {issue.fix.map((fixer, index) => (
                <div key={index} class="v-linter__issue-menu__fixer">
                  <button
                    type="button"
                    class="v-linter__issue-menu__fixer__button"
                    onClick={() => {
                      stack.close();
                      fixer.handler(view, issue);
                    }}>
                    <span class="v-linter__issue-menu__fixer__button__message">
                      {resolveWysiwygLinterFixMessage(fixer.message)}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    });
  }

  return Extension.create<WysiwygLinterOptions, WysiwygLinterStorage>({
    name: 'linter',

    addOptions() {
      return {
        plugins: [],
      };
    },
    addStorage() {
      return {
        issues: [],
      };
    },
    addProseMirrorPlugins() {
      const { plugins } = this.options;
      const { storage } = this;

      const runAll = (doc: ProsemirrorNode) => {
        const { issues, decorationSet } = runAllLinterPlugins(doc, plugins);
        storage.issues = issues;
        return decorationSet;
      };

      const getIssue = (id: string) =>
        storage.issues.find((issue) => issue.id === id);

      const getIssueElementByEvent = (
        source: EventTarget | null,
      ):
        | {
            issue: Issue;
          }
        | undefined => {
        if (!source || !(source instanceof HTMLElement)) {
          return;
        }
        const issueId = source.getAttribute(ISSUE_DATASET_NAME);
        const issue = issueId && getIssue(issueId);
        if (!issue) return;

        return {
          issue,
        };
      };

      const linterPlugin: Plugin<any> = new Plugin({
        key: new PluginKey('linter'),
        state: {
          init(_, { doc }) {
            return runAll(doc);
          },
          apply(transaction, oldState) {
            return transaction.docChanged ? runAll(transaction.doc) : oldState;
          },
        },
        props: {
          decorations(state) {
            return linterPlugin.getState(state);
          },
          handleClick(view, _, event) {
            const info = getIssueElementByEvent(event.target);
            if (!info) {
              return false;
            }

            const { issue } = info;
            const { from, to } = issue;

            const focus = () =>
              view.dispatch(
                view.state.tr
                  .setSelection(TextSelection.create(view.state.doc, from, to))
                  .scrollIntoView(),
              );

            focus();

            showMenu(view, issue, event);
            return true;
          },
        },
      });

      return [linterPlugin];
    },
  });
});
