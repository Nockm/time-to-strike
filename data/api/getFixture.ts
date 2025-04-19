import type * as Api from './apiType.ts';
import type { CallOpts } from './call.ts';
import { call } from './call.ts'; // eslint-disable-line no-duplicate-imports

interface GetFixtureOpts {
    'id': number;
}

export async function getFixture (opts: GetFixtureOpts, callOpts: CallOpts): Promise<Api.Response<Api.FixtureInfo[]> | null> {
    const ret = await call(`https://v3.football.api-sports.io/fixtures?id=${opts.id}`, callOpts);

    return ret as Api.Response<Api.FixtureInfo[]> | null; /* eslint-disable-line @typescript-eslint/no-unsafe-type-assertion */
}
