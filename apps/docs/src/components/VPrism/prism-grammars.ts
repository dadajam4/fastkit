/**
 * Every grammar the docs highlight, loaded after the global exists.
 *
 * The import below must stay first, and this file exists so that it can be.
 * `prismjs/components/prism-*` are written for script-tag use: each one ends by
 * calling into a **global** `Prism` (`}(Prism));`) and imports nothing, so the
 * bundler sees no dependency between them and the core and is free to run them
 * first. When it does, they throw `ReferenceError: Prism is not defined` and
 * the page loses every grammar — which is what happened once prismjs was split
 * into a chunk of its own, and what happens in the SSR bundle too if these
 * imports are moved above the core.
 *
 * Listing `./prism-global` ahead of them turns that invisible dependency into
 * an ordinary import edge, which ES modules guarantee to evaluate first.
 */
import './prism-global';

import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
