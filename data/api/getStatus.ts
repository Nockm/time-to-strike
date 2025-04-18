import type { Status, TypedHttpResponse } from './apiTypes.js';
import type { CallOpts } from './call.ts';
import { call } from './call.ts'; // eslint-disable-line no-duplicate-imports

export async function getStatus (callOpts: CallOpts): Promise<(TypedHttpResponse<Status> | null)> {
    const ret = await call('https://v3.football.api-sports.io/status', callOpts);

    return ret as TypedHttpResponse<Status> | null; /* eslint-disable-line @typescript-eslint/no-unsafe-type-assertion */
}
