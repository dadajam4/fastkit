import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection } from '~/components';

export default defineComponent({
  render() {
    return (
      <div>
        <VHero>Getting Started</VHero>

        <VDocsSection title="What is fastkit?">
          <p>A toolkit for quickly creating applications.</p>
          {/* <p>
            Babel is a toolchain that is mainly used to convert ECMAScript 2015+
            code into a backwards compatible version of JavaScript in current
            and older browsers or environments. Here are the main things Babel
            can do for you:
          </p>

          <ul>
            <li>Transform syntax</li>
            <li>
              Polyfill features that are missing in your target environment
              (through a third-party polyfill such as
              <a href="https://github.com/zloirock/core-js">core-js</a>)
            </li>
            <li>Source code transformations (codemods)</li>
            <li>
              And more! (check out these <a href="/videos.html">videos</a> for
              inspiration)
            </li>
          </ul> */}
        </VDocsSection>
      </div>
    );
  },
});
