/* eslint-disable camelcase */

import { getMetric, type Metric } from './metric.tsx';
import * as c_timecode from './c_timecode.tsx';

/* eslint-disable sort-keys */
export const registry: Metric[] = [
    getMetric({ 'key': 'c_summary' }),
    getMetric({ 'key': 'c_timecode', 'formatter': c_timecode.formatter, 'xfiller': c_timecode.filler, 'singular': 'minute' }),
    getMetric({ 'key': 'c_total_goals' }),
    getMetric({ 'key': 'e_assist_id' }),
    getMetric({ 'key': 'e_assist_name' }),
    getMetric({ 'key': 'e_comments' }),
    getMetric({ 'key': 'e_detail' }),
    getMetric({ 'key': 'e_player_id' }),
    getMetric({ 'key': 'e_player_name' }),
    getMetric({ 'key': 'e_team_id' }),
    getMetric({ 'key': 'e_team_name' }),
    getMetric({ 'key': 'e_time_elapsed' }),
    getMetric({ 'key': 'e_time_extra' }),
    getMetric({ 'key': 'e_type' }),
    getMetric({ 'key': 'f_fixture_id' }),
    getMetric({ 'key': 'f_fixture_referee' }),
    getMetric({ 'key': 'f_fixture_venue_name' }),
    getMetric({ 'key': 'f_goals_away' }),
    getMetric({ 'key': 'f_goals_home' }),
    getMetric({ 'key': 'f_league_country' }),
    getMetric({ 'key': 'f_league_id' }),
    getMetric({ 'key': 'f_league_round' }),
    getMetric({ 'key': 'f_league_season' }),
    getMetric({ 'key': 'f_lineups_0_formation' }),
    getMetric({ 'key': 'f_lineups_1_formation' }),
    getMetric({ 'key': 'f_score_fulltime_away' }),
    getMetric({ 'key': 'f_score_fulltime_home' }),
    getMetric({ 'key': 'f_teams_away_name' }),
    getMetric({ 'key': 'f_teams_home_name' }),
];
/* eslint-enable sort-keys */
