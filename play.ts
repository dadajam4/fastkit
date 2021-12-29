import {
  build,
  axiosErrorResolver,
  fetchResponseResolver,
  createCatcherNomalizer,
} from './packages/catcher/src';
import axios from 'axios';

const resolvers = [axiosErrorResolver, fetchResponseResolver];

interface Normalized {
  name?: string;
  status: number;
  message: string;
}

const normalizer = createCatcherNomalizer((resolvedData) => {
  // function normalizer(): Normalized;
  // function normalizer(status: number): Normalized;
  // function normalizer(info: { status: number; hoge: string }): Normalized;
  function normalizer(
    statusMessageOrInfo:
      | string
      | number
      | {
          name?: string;
          status?: number;
          message?: string;
        },
  ): Normalized {
    if (typeof statusMessageOrInfo === 'string') {
      statusMessageOrInfo = { message: statusMessageOrInfo };
    } else if (typeof statusMessageOrInfo === 'number') {
      statusMessageOrInfo = { status: statusMessageOrInfo };
    }

    const { status = 500, message = 'エラーが発生しました。' } =
      statusMessageOrInfo;

    const result: Normalized = {
      status,
      message,
    };

    const { axiosError } = resolvedData;
    if (axiosError && axiosError.response) {
      result.name = axiosError.name;
      result.status = axiosError.response.status;
      result.message = axiosError.message;
    }

    return result;
  }

  return normalizer;
}, resolvers);

const TestError = build({
  defaultName: 'TestError',
  resolvers: [
    ...resolvers,
    (source, ctx) => {
      return {
        ggggg: true,
      };
      ctx.resolve();
    },
  ],
  normalizer,
});

async function main() {
  try {
    // if (process) {
    //   xxxjoasjio();
    // }
    await axios.get('https://google.com/jijiji');
  } catch (_err: unknown) {
    // const err = new TestError(
    //   {
    //     status: 600,
    //   },
    //   exception,
    // );
    // const err = new TestError(_err);
    // TestError.from(null);

    // const newError = new TestError()

    // const err = TestError.from(_err, {
    //   status: 200,
    //   message: 'hoge^^-----',
    // });
    // const err = TestError.from(_err);
    const err = new TestError({});
    const err2 = TestError.from(err, {
      status: 404,
      message: 'なんかエラー',
    });
    console.error(err.toJSON(), err2.toJSON());

    // const err2 = new TestError(null, )
    // const err2 = new TestError(err);

    // console.log(err === err2);
  }
}

main();

// const hoge = new TestError();

// console.log(hoge);
// const { cli } = require('./packages/create-fastkit-app/src/cli');
// cli();

// import { hashElement } from 'folder-hash';

// async function main() {
//   const hash = await hashElement('./core');
//   console.log(hash);
// }

// main();

// import './plugins/playground-aliases';
