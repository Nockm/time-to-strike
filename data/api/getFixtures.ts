import type { GameBase, TypedHttpResponse } from './apiTypes.js';
import type { CallOpts } from './call.ts';
import { call } from './call.ts'; // eslint-disable-line no-duplicate-imports

interface GetFixturesOpts {
    'league': number;
    'season': number;
}

export async function getFixtures (opts: GetFixturesOpts, callOpts: CallOpts): Promise<TypedHttpResponse<GameBase[]> | null> {
    const ret = await call(`https://v3.football.api-sports.io/fixtures?league=${opts.league}&season=${opts.season}&status=FT-AET-PEN-1H-HT-2H-ET-BT-P`, callOpts);

    return ret as TypedHttpResponse<GameBase[]> | null; /* eslint-disable-line @typescript-eslint/no-unsafe-type-assertion */
}
