import { defineComponent, ref } from 'vue';
import {
  VSelect,
  VMenu,
  VTextField,
  VNumberField,
  createMaskedOptions,
  MaskedRange,
} from '@fastkit/vui';
import { range } from '@fastkit/helpers';

function Test(attrs: any = {}) {
  return (
    <VSelect
      items={range(5, 1).map((i) => ({
        label: `オプション${i}`,
        value: String(i),
      }))}
      {...attrs}
    />
  );
}

function Rows(num: number) {
  return (
    <div>
      {range(num, 1).map((n) => (
        <p key={n}>{`Hello World. ${n}`}</p>
      ))}
    </div>
  );
}

export default defineComponent({
  setup() {
    const opened = ref(false);
    const EXAMPLES = [
      '30569309025904',
      '4000056655665556',
      '6011000990139424',
      '5200828282828210',
      '3566002020360505',
      '6759649826438453',
    ];
    const input = ref(EXAMPLES[0]);
    const meta = ref<any>(null);
    const number = ref(16323);

    const numberMask = createMaskedOptions({
      mask: Number,
      thousandsSeparator: ',',
      mapToRadix: ['.'],
    });

    function clearInput() {
      input.value = '';
    }

    function randomInput() {
      const index = Math.floor(Math.random() * EXAMPLES.length);
      input.value = EXAMPLES[index];
    }

    const yymm = createMaskedOptions({
      mask: 'YY{/}MM',
      blocks: {
        YY: {
          mask: '00',
        },
        MM: {
          mask: MaskedRange,
          from: 1,
          to: 12,
        },
      },
    });

    const mask = createMaskedOptions({
      mask: [
        {
          mask: '0000 000000 00000',
          meta: {
            regex: '^3[47]\\d{0,13}',
            cardtype: 'american express',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            regex: '^(?:6011|65\\d{0,2}|64[4-9]\\d?)\\d{0,12}',
            cardtype: 'discover',
          },
        },
        {
          mask: '0000 000000 0000',
          meta: {
            regex: '^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}',
            cardtype: 'diners',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            regex: '^(5[1-5]\\d{0,2}|22[2-9]\\d{0,1}|2[3-7]\\d{0,2})\\d{0,12}',
            cardtype: 'mastercard',
          },
        },
        {
          mask: '0000 000000 00000',
          meta: {
            regex: '^(?:2131|1800)\\d{0,11}',
            cardtype: 'jcb15',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            regex: '^(?:35\\d{0,2})\\d{0,12}',
            cardtype: 'jcb',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            regex: '^(?:5[0678]\\d{0,2}|6304|67\\d{0,2})\\d{0,12}',
            cardtype: 'maestro',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            regex: '^4\\d{0,15}',
            cardtype: 'visa',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            regex: '^62\\d{0,14}',
            cardtype: 'unionpay',
          },
        },
        {
          mask: '0000 0000 0000 0000',
          meta: {
            cardtype: 'Unknown',
          },
        },
      ],
      dispatch: (appended, dynamicMasked) => {
        const number = (dynamicMasked.value + appended).replace(/\D/g, '');

        for (let i = 0; i < dynamicMasked.compiledMasks.length; i++) {
          const re = new RegExp(dynamicMasked.compiledMasks[i].meta.regex);
          if (number.match(re) != null) {
            return dynamicMasked.compiledMasks[i];
          }
        }
        return dynamicMasked.compiledMasks[
          dynamicMasked.compiledMasks.length - 1
        ];
      },
    });

    return () => (
      <div>
        <button type="button" onClick={clearInput}>
          CLEAR
        </button>
        <button type="button" onClick={randomInput}>
          RANDOM
        </button>

        <VTextField
          v-model={input.value}
          mask={mask}
          maskModel="unmasked"
          onAcceptDynamicMaskMeta={(ev) => {
            meta.value = ev;
          }}
        />

        <pre>
          <code>{input.value}</code>
        </pre>
        <pre>
          <code>{meta.value?.cardtype}</code>
        </pre>

        <VTextField mask={yymm} />

        <VNumberField
          mask={numberMask}
          v-model={number.value}
          maskModel="typed"
        />
        <pre>
          <code>{`${typeof number.value} : ${number.value}`}</code>
        </pre>
        <h1>Vui</h1>

        <button
          type="button"
          onClick={() => {
            opened.value = true;
          }}
          onFocus={() => {
            opened.value = true;
          }}>
          hello
        </button>

        <VMenu
          v-model={opened.value}
          v-slots={{
            activator: ({ attrs }) => {
              return (
                <button type="button" {...attrs}>
                  open
                </button>
              );
            },
          }}>
          <div>Hello</div>
        </VMenu>

        {Rows(3)}

        {Test()}

        {Rows(3)}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}>
          <div style={{ width: '100px' }}>xxxxx</div>
          {Test({
            style: {
              width: '200px',
            },
          })}
        </div>

        <div
          style={{
            height: '300px',
            background: '#efefef',
            overflow: 'auto',
          }}>
          {Rows(3)}

          {Test()}

          {Rows(3)}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}>
            <div style={{ width: '100px ' }}>xxxxx</div>
            {Test({
              style: {
                width: '200px',
              },
            })}
          </div>
        </div>

        {Rows(3)}

        {Test()}

        {Rows(10)}
      </div>
    );
  },
});
