import type * as Api from './apiType.ts';
import type { CallOpts } from './call.ts';
import { call } from './call.ts'; // eslint-disable-line no-duplicate-imports

export async function getStatus (callOpts: CallOpts): Promise<(Api.Response<Api.Status> | null)> {
    const ret = await call('https://v3.football.api-sports.io/status', callOpts);

    return ret as Api.Response<Api.Status> | null; /* eslint-disable-line @typescript-eslint/no-unsafe-type-assertion */
}
