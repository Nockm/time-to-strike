import { getFixture } from './api/getFixture.ts';
import { getFixtures } from './api/getFixtures.ts';
import { getStatus } from './api/getStatus.ts';
import type { Game, GameEvent } from './api/apiTypes.ts';
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
 *  Stats
 */

export function updateCounter (counter: Record<string, number>, key: string): void {
    if (!(key in counter)) {
        counter[key] = 0;
    }
    counter[key] += 1;
}

export function printCounter (counter: Record<string, number>): void {
    const keys = Object.keys(counter).sort();

    keys.forEach((key) => {
        console.log(`[${key}]  ${counter[key]}`);
    });
}

interface Report {
    'events': ReportEvent[];
}

interface ReportEvent {
    /* eslint-disable @typescript-eslint/naming-convention */
    'assist.id': number;
    'assist.name': string;
    'comments': null;
    'detail': string;
    'player.id': number;
    'player.name': string;
    'team.id': number;
    // 'team.logo': string;
    'team.name': string;
    'time.elapsed': number;
    'time.extra': null | number;
    'type': string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

function eventToReportEvent (gameEvent: GameEvent): ReportEvent {
    const reportEvent: ReportEvent = {
        /* eslint-disable @typescript-eslint/naming-convention */
        'assist.id': gameEvent.assist.id,
        'assist.name': gameEvent.assist.name,
        'comments': gameEvent.comments,
        'detail': gameEvent.detail,
        'player.id': gameEvent.player.id,
        'player.name': gameEvent.player.name,
        'team.id': gameEvent.team.id,
        // 'team.logo': gameEvent.team.logo,
        'team.name': gameEvent.team.name,
        'time.elapsed': gameEvent.time.elapsed,
        'time.extra': gameEvent.time.extra,
        'type': gameEvent.type,
        /* eslint-enable @typescript-eslint/naming-convention */
    };

    return reportEvent;
}

function gameToReportEvents (game: Game): ReportEvent[] {
    return game.events.map(eventToReportEvent);
}

const doIt = async (requestedCredits = 0): Promise<void> => {
    let credits = await getCredits(requestedCredits);

    const fixtures = await getFixtures({ 'league': 39, 'season': 2023 }, { 'useLocal': true, 'useRemote': true });

    if (!fixtures) {
        return;
    }

    console.log(fixtures.response[0].league);

    const allFixtureIds = fixtures.response.map((apiFixturesItem) => apiFixturesItem.fixture.id);
    console.log(`numFixtureIds=${allFixtureIds.length}`);

    const report: Report = {
        'events': [],
    };

    const fixtureIds = allFixtureIds.slice(0, -1);

    console.log(`[CREDITS] ${credits}`);
    for (const fixtureId of fixtureIds) {
        const useRemote = credits > 0;
        const fixture = await getFixture({ 'id': fixtureId }, {
            // 'logLocalError': true,
            // 'logLocalSuccess': true,
            // 'logRemoteError': true,
            // 'logRemoteSuccess': true,
            'useLocal': true,
            useRemote,
        });

        if (fixture) {
            const games: Game[] = fixture.response;

            const newEvents: ReportEvent[] = games.map(gameToReportEvents).flat(1);
            report.events.push(...newEvents);

            if (!fixture.cached) {
                console.log(`[CREDITS] ${credits}`);
                credits -= 1;

                if (useRemote) {
                    await delay(10000);
                }
            }
        }
    }

    // const keys = Object.keys(counter).sort();
    writeFileSync(path.join(getDirname(import.meta.url), 'db.json'), JSON.stringify(report, null, 2));
};

doIt().then(() => {
    console.log('Done');
}).
    catch((reason: unknown) => {
        console.log('Error');
        console.log(reason);
    });
