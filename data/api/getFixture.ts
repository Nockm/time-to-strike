import type { Game, TypedHttpResponse } from './apiTypes.js';
import type { CallOpts } from './call.ts';
import { call } from './call.ts'; // eslint-disable-line no-duplicate-imports

interface GetFixtureOpts {
    'id': number;
}

export async function getFixture (opts: GetFixtureOpts, callOpts: CallOpts): Promise<TypedHttpResponse<Game[]> | null> {
    const ret = await call(`https://v3.football.api-sports.io/fixtures?id=${opts.id}`, callOpts);

    return ret as TypedHttpResponse<Game[]> | null; /* eslint-disable-line @typescript-eslint/no-unsafe-type-assertion */
}
