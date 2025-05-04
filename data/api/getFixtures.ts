import type * as Api from './apiType.ts';
import type { CallOpts } from './call.ts';
import { call } from './call.ts';

interface GetFixturesOpts {
    'league': number;
    'season': number;
}

export async function getFixtures (opts: GetFixturesOpts, callOpts: CallOpts): Promise<Api.Response<Api.BaseFixtureInfo[]> | null> {
    const ret = await call(`https://v3.football.api-sports.io/fixtures?league=${opts.league}&season=${opts.season}&status=FT-AET-PEN-1H-HT-2H-ET-BT-P`, callOpts);

    return ret as Api.Response<Api.BaseFixtureInfo[]> | null; /* eslint-disable-line @typescript-eslint/no-unsafe-type-assertion */
}
