import './Linter.scss';

import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { LinterPlugin, LinterResult as Issue } from './LinterPlugin';
import { debounce } from '@fastkit/helpers';
import { EditorView } from 'prosemirror-view';

const PROBLEM_CLASS_NAME = 'v-linter__problem';
const ISSUE_ICON_CLASS_NAME = 'v-linter__issue-icon';
const ISSUE_MENU_CLASS_NAME = 'v-linter__issue-menu';

interface IssueElement extends HTMLDivElement {
  issue?: Issue;
}

function renderIcon(view: EditorView<any>, issue: Issue) {
  const { level = 'warning' } = issue;
  const icon: IssueElement = document.createElement('div');

  icon.className = `${ISSUE_ICON_CLASS_NAME} ${level}-scope`;
  icon.title = issue.message;
  icon.issue = issue;

  return icon;
}

function renderMenu(view: EditorView<any>, issue: Issue) {
  const menuWrapper = document.createElement('div');
  menuWrapper.className = 'v-linter__issue-menu-wrapper';
  const menu: IssueElement = document.createElement('div');

  menu.className = `${ISSUE_MENU_CLASS_NAME} elevation-3`;
  menu.innerText = issue.message;

  const { fix, fixMessage } = issue;

  if (fix && fixMessage) {
    const $fix = document.createElement('button');
    $fix.type = 'button';
    $fix.innerHTML = fixMessage;
    $fix.addEventListener('click', () => {
      fix(view, issue);
    });
    $fix.className = `v-linter__issue-menu__fix`;
    menu.appendChild($fix);
  }

  menu.issue = issue;

  menuWrapper.appendChild(menu);
  return menuWrapper;
}

function getIssueElement(
  source: HTMLElement | EventTarget | null,
  className: string,
): IssueElement | undefined {
  if (!source || !(source instanceof HTMLElement)) {
    return;
  }
  if (source.classList.contains(className)) {
    return source as IssueElement;
  }
  const el = source.closest(`.${className}`);
  if (el) {
    return el as IssueElement;
  }
}

function getIconElement(
  source: HTMLElement | EventTarget | null,
): IssueElement | undefined {
  return getIssueElement(source, ISSUE_ICON_CLASS_NAME);
}

function getMenuElement(
  source: HTMLElement | EventTarget | null,
): IssueElement | undefined {
  return getIssueElement(source, ISSUE_MENU_CLASS_NAME);
}

function getProblemElement(
  source: HTMLElement | EventTarget | null,
): IssueElement | undefined {
  return getIssueElement(source, PROBLEM_CLASS_NAME);
}

function runAllLinterPlugins(
  doc: ProsemirrorNode,
  plugins: Array<typeof LinterPlugin>,
) {
  const decorations: [any?] = [];

  const results = plugins
    .map((RegisteredLinterPlugin) => {
      return new RegisteredLinterPlugin(doc).scan().getResults();
    })
    .flat();

  results.forEach((issue) => {
    const { level = 'warning' } = issue;
    decorations.push(
      Decoration.inline(issue.from, issue.to, {
        class: `${PROBLEM_CLASS_NAME} ${level}-scope`,
        'data-issue': JSON.stringify(issue),
        title: issue.message,
      }),
      Decoration.widget(issue.from, (view) => renderIcon(view, issue)),
      Decoration.widget(issue.from, (view) => renderMenu(view, issue)),
    );
  });

  return DecorationSet.create(doc, decorations);
}

export interface LinterOptions {
  plugins: Array<typeof LinterPlugin>;
}

function updateMenusPosition(editorElement: Element) {
  const { left, right } = editorElement.getBoundingClientRect();
  const menus = Array.from(
    editorElement.querySelectorAll(`.${ISSUE_MENU_CLASS_NAME}`),
  );
  menus.forEach((menu) => {
    const { left: menuLeft, right: menuRight } = menu.getBoundingClientRect();
    const overflow = menuRight - right;
    let offset = 0;
    if (overflow > 0) {
      offset = -overflow;

      if (menuLeft + offset < left) {
        offset = 0;
      }
    }
    (menu as HTMLElement).style.transform = `translateX(${offset}px)`;
  });
}

const debouncedUpdateMenusPosition = debounce(updateMenusPosition, 250);

export const Linter = Extension.create<LinterOptions>({
  name: 'linter',

  addOptions() {
    return {
      plugins: [],
    };
  },

  onCreate() {
    const { dom } = this.editor.view;
    debouncedUpdateMenusPosition(dom);
  },

  onUpdate() {
    const { dom } = this.editor.view;
    debouncedUpdateMenusPosition(dom);
  },

  addProseMirrorPlugins() {
    const { plugins } = this.options;

    return [
      new Plugin({
        key: new PluginKey('linter'),
        state: {
          init(_, { doc }) {
            return runAllLinterPlugins(doc, plugins);
          },
          apply(transaction, oldState) {
            return transaction.docChanged
              ? runAllLinterPlugins(transaction.doc, plugins)
              : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, _, event) {
            const activeMenus = Array.from(
              view.dom.querySelectorAll(`.${ISSUE_MENU_CLASS_NAME}--active`),
            );

            activeMenus.forEach((menu) =>
              menu.classList.remove(`${ISSUE_MENU_CLASS_NAME}--active`),
            );

            const problem = getProblemElement(event.target);

            const issueString = problem && problem.dataset['issue'];

            const issue = issueString && JSON.parse(issueString);
            if (issue) {
              const menuWrapper = problem.previousElementSibling;
              const menu =
                menuWrapper &&
                menuWrapper.querySelector(`.${ISSUE_MENU_CLASS_NAME}`);
              menu && menu.classList.add(`${ISSUE_MENU_CLASS_NAME}--active`);

              const { from, to } = issue;
              view.dispatch(
                view.state.tr
                  .setSelection(TextSelection.create(view.state.doc, from, to))
                  .scrollIntoView(),
              );

              return true;
            }

            const menu = getMenuElement(event.target);

            if (menu) {
              menu.classList.add(`${ISSUE_MENU_CLASS_NAME}--active`);
            }

            const target = getIconElement(event.target);

            if (target && target.issue) {
              const menuWrapper = target.nextElementSibling;
              const menu =
                menuWrapper &&
                menuWrapper.querySelector(`.${ISSUE_MENU_CLASS_NAME}`);
              menu && menu.classList.add(`${ISSUE_MENU_CLASS_NAME}--active`);

              const { from, to } = target.issue;

              view.dispatch(
                view.state.tr
                  .setSelection(TextSelection.create(view.state.doc, from, to))
                  .scrollIntoView(),
              );

              return true;
            }

            return false;
          },
          handleDoubleClick(view, _, event) {
            const target = getIconElement(event.target);

            if (target && target.issue) {
              const prob = target.issue;

              if (prob.fix) {
                prob.fix(view, prob);
                view.focus();
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
