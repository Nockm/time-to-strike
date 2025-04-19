import type * as Api from './api/apiType.ts';
import type * as Db from './db/dbTypes.ts';
import * as counters from './util/counters.ts';
import { getFixture } from './api/getFixture.ts';
import { getFixtures as getSeasonFixtures } from './api/getFixtures.ts';
import { getStatus } from './api/getStatus.ts';
import { writeFileSync } from 'fs';
import { getDirname } from './util/pathUtil.ts';
import path from 'path';

const delay = (ms: number): unknown => new Promise((res) => setTimeout(res, ms)); // eslint-disable-line no-promise-executor-return

/*
 *  Credits
 */

async function getCreditsLeft (): Promise<number> {
    const apiStatus = await getStatus({ 'useLocal': false, 'useRemote': true });

    let numCallsLeft = 0;

    if (apiStatus) {
        console.log(`[Status] Request quota: ${apiStatus.response.requests.current}/${apiStatus.response.requests.limit_day}`);
        numCallsLeft = apiStatus.response.requests.limit_day - apiStatus.response.requests.current;
    }

    return numCallsLeft;
}

async function getCredits (requestedCredits: number): Promise<number> {
    const creditsLeft = await getCreditsLeft();

    // Default to how many credits we actually have.
    let credits = requestedCredits >= 0
        ? requestedCredits
        : creditsLeft;

    // Ensure we don't use more credits than we actually have.
    credits = Math.min(credits, creditsLeft);

    console.log(`[CREDITS] ${credits} (${requestedCredits} requested, ${creditsLeft} available.)`);

    return credits;
}

/*
 * API-to-DB conversion.
 */

function apiEventToDbEvent (apiFixtureInfo: Api.FixtureInfo, apiEvent: Api.Event): Db.Event {
    let timecode = 0;

    timecode += apiEvent.time.elapsed <= 45
        ? 100
        : 200;

    timecode += apiEvent.time.elapsed % 45;
    timecode += apiEvent.time.extra || 0;

    const dbEvent: Db.Event = {
        /* eslint-disable @typescript-eslint/naming-convention */
        'assist.id': apiEvent.assist.id,
        'assist.name': apiEvent.assist.name,
        'comments': apiEvent.comments || '',
        'detail': apiEvent.detail,
        'fixtureId': apiFixtureInfo.fixture.id,
        'player.id': apiEvent.player.id,
        'player.name': apiEvent.player.name,
        'summary': `${apiFixtureInfo.teams.home.name} ${apiFixtureInfo.goals.home}-${apiFixtureInfo.goals.away} ${apiFixtureInfo.teams.away.name} on ${apiFixtureInfo.fixture.date.slice(0, 10)}`,
        'team.id': apiEvent.team.id,
        // 'team.logo': gameEvent.team.logo,
        'team.name': apiEvent.team.name,
        'time.elapsed': apiEvent.time.elapsed,
        'time.extra': apiEvent.time.extra,
        timecode,
        'type': apiEvent.type,
        /* eslint-enable @typescript-eslint/naming-convention */
    };

    return dbEvent;
}

function apiFixtureInfoToDbEvents (apiFixtureInfo: Api.FixtureInfo): Db.Event[] {
    return apiFixtureInfo.events.map((apiEvent) => apiEventToDbEvent(apiFixtureInfo, apiEvent));
}

/*
 * Processing.
 */

async function processSeason ({
    dbRoot,
    league = 39,
    requestedCredits = 1,
    season = 2023,
}: {
    'dbRoot': Db.Root;
    'league'?: number;
    'requestedCredits'?: number;
    'season'?: number;
}): Promise<void> {
    let credits = await getCredits(requestedCredits);

    const getSeasonFixturesResponse = await getSeasonFixtures({ league, season }, { 'useLocal': true, 'useRemote': true });
    if (!getSeasonFixturesResponse) {
        return;
    }

    const baseFixtureInfos: Api.BaseFixtureInfo[] = getSeasonFixturesResponse.response;
    const fixtureIds = baseFixtureInfos.map((fixture) => fixture.fixture.id);
    const leagueName = baseFixtureInfos[0].league.name;
    const seasonName = `${leagueName}, ${season}`;
    const logPrefix = `[processSeason] [${seasonName}]`;

    console.log(`${logPrefix} ${fixtureIds.length} fixtures available.`);

    let numFixturesProcessed = 0;

    console.log(`${logPrefix} Starting: ${credits} credits available.`);
    for (const fixtureId of fixtureIds) {
        // Only make an API call if we have credits left.
        const useRemote = credits > 0;

        // Get the fixture.
        const getFixtureResponse = await getFixture({ 'id': fixtureId }, {
            // 'logLocalError': true,
            // 'logLocalSuccess': true,
            // 'logRemoteError': true,
            // 'logRemoteSuccess': true,
            'useLocal': true,
            useRemote,
        });

        if (!getFixtureResponse) { // eslint-disable-line no-negated-condition
            console.log(`${logPrefix} Stopping: Could not obtain fixture ${fixtureId}.`);
            break;
        } else {
            const fixtureInfo = getFixtureResponse.response;

            const dbEvents: Db.Event[] = fixtureInfo.map(apiFixtureInfoToDbEvents).flat(1);
            dbRoot.events.push(...dbEvents);

            const liveApiCallMade = useRemote && !getFixtureResponse.cached;
            if (liveApiCallMade) {
                // Decrement credits.
                console.log(`[CREDITS] ${credits}`);
                credits -= 1;

                // Wait, as the rate limit is 10 calls per minute.
                await delay(10000);
            }

            numFixturesProcessed += 1;
        }
    }
    console.log(`${logPrefix} Finished: Obtained ${numFixturesProcessed}/${fixtureIds.length} fixtures.`);
}

/*
 * Reporting.
 */

async function doIt (): Promise<void> {
    const dbRoot: Db.Root = {
        'events': [],
    };

    await processSeason({ dbRoot, 'league': 39, 'season': 2023 });

    /* eslint-disable @stylistic/js/array-element-newline */
    counters.count(true, false, true, dbRoot.events, (event) => [event.type, event.detail, event.comments].join(', '));
    dbRoot.events = dbRoot.events.filter((event) => event.type === 'Goal');
    counters.count(true, false, true, dbRoot.events, (event) => [event.timecode.toString()].join(', '));

    dbRoot.events = counters.sortArrayByString(dbRoot.events, (event) => [
        event.timecode,
        event.fixtureId,
        event.type,
        event['player.id'],
    ].join(' '));

    writeFileSync(path.join(getDirname(import.meta.url), 'db.json'), JSON.stringify(dbRoot, null, 2));
    /* eslint-enable @stylistic/js/array-element-newline */
}

doIt().then(() => {
    console.log('Done');
}).
    catch((reason: unknown) => {
        console.log('Error');
        console.log(reason);
    });
