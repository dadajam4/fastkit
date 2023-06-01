import { defineComponent } from 'vue';
import { VSelect } from '@fastkit/vui';
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
  render() {
    return (
      <div>
        <h1>Vui</h1>

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
