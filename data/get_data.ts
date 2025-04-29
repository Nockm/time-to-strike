import type * as Api from './api/apiType.ts';
import type * as Db from './db/dbTypes.ts';
import * as counters from './util/counters.ts';
import { getFixture } from './api/getFixture.ts';
import { getFixtures as getSeasonFixtures } from './api/getFixtures.ts';
import { getStatus } from './api/getStatus.ts';
import { writeFileSync } from 'fs';
import { ensureEmptyDir, getDirname } from './util/pathUtil.ts';
import path from 'path';
import { compressString } from './util/stringCompressionUtil.ts';

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

const USE_ALL_CREDITS = -1;
const USE_NO_CREDITS = 0;

async function getCredits (requestedCredits: number): Promise<number> {
    const creditsLeft = await getCreditsLeft();

    // Default to how many credits we actually have.
    let credits = 0;

    if (requestedCredits === USE_ALL_CREDITS) {
        credits = creditsLeft;
    }

    if (requestedCredits === USE_NO_CREDITS) {
        credits = 0;
    }

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
        ? 100 + apiEvent.time.elapsed
        : 200 + apiEvent.time.elapsed - 45;

    timecode += apiEvent.time.extra || 0;

    const players = [
        apiFixtureInfo.players[0].players,
        apiFixtureInfo.players[1].players,
    ].flat();
    const foundPlayer: any = players.find((x) => x.player.id === apiEvent.player.id);
    if (!foundPlayer) {
        console.log(`[WARNING] Player ${apiEvent.player.id} not found`);
    }

    const teams = Object.values(apiFixtureInfo.teams);
    const foundTeam: any = teams.find((x) => x.id === apiEvent.team.id);
    if (!foundTeam) {
        console.log(`[WARNING] Team ${apiEvent.team.id} not found`);
    }

    const dbEvent: Db.Event = {
        /* eslint-disable @typescript-eslint/naming-convention */
        'c_summary': `${apiFixtureInfo.teams.home.name} ${apiFixtureInfo.goals.home}-${apiFixtureInfo.goals.away} ${apiFixtureInfo.teams.away.name} on ${apiFixtureInfo.fixture.date.slice(0, 10)}`,
        'c_timecode': timecode,
        'c_total_goals': apiFixtureInfo.score.fulltime.home + apiFixtureInfo.score.fulltime.away,
        'e_assist_id': apiEvent.assist.id,
        'e_assist_name': apiEvent.assist.name,
        'e_comments': apiEvent.comments || '',
        'e_detail': apiEvent.detail,
        'e_player_id': apiEvent.player.id,
        'e_player_name': apiEvent.player.name,
        'e_player_name_image': foundPlayer.player.photo,
        'e_team_id': apiEvent.team.id,
        'e_team_name': apiEvent.team.name,
        'e_team_name_image': foundTeam.logo,
        'e_time_elapsed': apiEvent.time.elapsed,
        'e_time_extra': apiEvent.time.extra,
        'e_type': apiEvent.type,
        'f_fixture_id': apiFixtureInfo.fixture.id,
        'f_fixture_referee': apiFixtureInfo.fixture.referee,
        'f_fixture_venue_name': apiFixtureInfo.fixture.venue.name,
        'f_goals_away': apiFixtureInfo.goals.away,
        'f_goals_home': apiFixtureInfo.goals.home,
        'f_league_country': apiFixtureInfo.league.country,
        'f_league_id': apiFixtureInfo.league.id,
        'f_league_round': apiFixtureInfo.league.round,
        'f_league_season': apiFixtureInfo.league.season,
        'f_lineups_0_formation': apiFixtureInfo.lineups[0].formation,
        'f_lineups_1_formation': apiFixtureInfo.lineups[1].formation,
        'f_score_fulltime_away': apiFixtureInfo.score.fulltime.away,
        'f_score_fulltime_home': apiFixtureInfo.score.fulltime.home,
        'f_teams_away_name': apiFixtureInfo.teams.away.name,
        'f_teams_home_name': apiFixtureInfo.teams.home.name,
        // 'team.logo': gameEvent.team.logo,
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
    creditsAvailable,
    season = 2023,
}: {
    'dbRoot': Db.Root;
    'league'?: number;
    'creditsAvailable': number;
    'season'?: number;
}): Promise<number> {
    const getSeasonFixturesResponse = await getSeasonFixtures({ league, season }, { 'useLocal': true, 'useRemote': true });
    if (!getSeasonFixturesResponse) {
        return 0;
    }
    let credits = creditsAvailable;

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
                await delay(7500);
            }

            numFixturesProcessed += 1;
        }
    }
    console.log(`${logPrefix} Finished: Obtained ${numFixturesProcessed}/${fixtureIds.length} fixtures.`);

    return credits;
}

/*
 * Reporting.
 */

export function count<T> (
    sortKeys: boolean,
    sortVals: boolean,
    log: boolean,
    items: T[],
    getKeyValPairFunc: (item: T) => string,
    savePath?: string,
): Record<string, number> {
    let counter = counters.getCounter(items, getKeyValPairFunc);

    if (sortKeys) {
        counter = counters.sortRecordByKey(counter);
    }
    if (sortVals) {
        counter = counters.sortRecordByValue(counter);
    }

    if (log) {
        console.log(JSON.stringify(counter, null, 2));
    }

    if (savePath) {
        writeFileSync(savePath, JSON.stringify(counter, null, 2), { 'encoding': 'utf-8' });
    }

    return counter;
}

async function doIt ({
    requestedCredits = 0,
}): Promise<void> {
    const dbRoot: Db.Root = {
        'events': [],
    };

    let credits = await getCredits(requestedCredits);

    credits = await processSeason({ 'creditsAvailable': credits, dbRoot, 'league': 39, 'season': 2023 });
    credits = await processSeason({ 'creditsAvailable': credits, dbRoot, 'league': 39, 'season': 2022 });
    credits = await processSeason({ 'creditsAvailable': credits, dbRoot, 'league': 39, 'season': 2021 });

    const outputDir = path.join(getDirname(import.meta.url), 'output');
    ensureEmptyDir(outputDir);

    count(true, false, false, dbRoot.events, (event) => [event.e_type, event.e_detail, event.e_comments].join(', '), path.join(outputDir, 'goalTimecodes.json'));
    // dbRoot.events = dbRoot.events.filter((event) => event.type === 'Goal');
    count(true, false, false, dbRoot.events, (event) => [event.c_timecode.toString()].join(', '), path.join(outputDir, 'eventTypes.json'));

    dbRoot.events = counters.sortArrayByString(dbRoot.events, (event) => [
        event.c_timecode,
        event.f_fixture_id,
        event.e_type,
        event.e_player_id,
    ].join(' '));

    const jsonPath = path.join(outputDir, 'db.json');
    const jsonZipB64Path = path.join(outputDir, 'db.dat');
    const jsonContent = JSON.stringify(dbRoot, null, 2);
    writeFileSync(jsonPath, jsonContent);
    writeFileSync(jsonZipB64Path, compressString(jsonContent));

    console.log(`${credits} credits left.`);
}

const args = process.argv.slice(2);

const opts = {
    'requestedCredits': args.length > 0 && parseInt(args[0], 10) || 0,
};

doIt(opts).then(() => {
    console.log('Done');
})
    .catch((reason: unknown) => {
        console.log('Error');
        console.log(reason);
    });
