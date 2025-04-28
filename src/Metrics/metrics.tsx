/* eslint-disable camelcase */

import { getMetric, type Metric } from './metric.tsx';
import * as c_timecode from './c_timecode.tsx';

/* eslint-disable sort-keys */
export const allMetrics: Record<string, Metric> = {
    'c_summary': getMetric({ 'key': 'c_summary' }),
    'c_timecode': getMetric({ 'key': 'c_timecode', 'formatter': c_timecode.formatter, 'xfiller': c_timecode.filler, 'singular': 'minute' }),
    'c_total_goals': getMetric({ 'key': 'c_total_goals' }),
    'e_assist_id': getMetric({ 'key': 'e_assist_id' }),
    'e_assist_name': getMetric({ 'key': 'e_assist_name' }),
    'e_comments': getMetric({ 'key': 'e_comments' }),
    'e_detail': getMetric({ 'key': 'e_detail' }),
    'e_player_id': getMetric({ 'key': 'e_player_id' }),
    'e_player_name': getMetric({ 'key': 'e_player_name' }),
    'e_team_id': getMetric({ 'key': 'e_team_id' }),
    'e_team_name': getMetric({ 'key': 'e_team_name' }),
    'e_time_elapsed': getMetric({ 'key': 'e_time_elapsed' }),
    'e_time_extra': getMetric({ 'key': 'e_time_extra' }),
    'e_type': getMetric({ 'key': 'e_type' }),
    'f_fixture_id': getMetric({ 'key': 'f_fixture_id' }),
    'f_fixture_referee': getMetric({ 'key': 'f_fixture_referee' }),
    'f_fixture_venue_name': getMetric({ 'key': 'f_fixture_venue_name' }),
    'f_goals_away': getMetric({ 'key': 'f_goals_away' }),
    'f_goals_home': getMetric({ 'key': 'f_goals_home' }),
    'f_league_country': getMetric({ 'key': 'f_league_country' }),
    'f_league_id': getMetric({ 'key': 'f_league_id' }),
    'f_league_round': getMetric({ 'key': 'f_league_round' }),
    'f_league_season': getMetric({ 'key': 'f_league_season' }),
    'f_lineups_0_formation': getMetric({ 'key': 'f_lineups_0_formation' }),
    'f_lineups_1_formation': getMetric({ 'key': 'f_lineups_1_formation' }),
    'f_score_fulltime_away': getMetric({ 'key': 'f_score_fulltime_away' }),
    'f_score_fulltime_home': getMetric({ 'key': 'f_score_fulltime_home' }),
    'f_teams_away_name': getMetric({ 'key': 'f_teams_away_name' }),
    'f_teams_home_name': getMetric({ 'key': 'f_teams_home_name' }),
};
/* eslint-enable sort-keys */

export const registry: Metric[] = [
    allMetrics.c_summary,
    allMetrics.c_timecode,
    allMetrics.c_total_goals,
    allMetrics.e_assist_id,
    allMetrics.e_assist_name,
    allMetrics.e_comments,
    allMetrics.e_detail,
    allMetrics.e_player_id,
    allMetrics.e_player_name,
    allMetrics.e_team_id,
    allMetrics.e_team_name,
    allMetrics.e_time_elapsed,
    allMetrics.e_time_extra,
    allMetrics.e_type,
    allMetrics.f_fixture_id,
    allMetrics.f_fixture_referee,
    allMetrics.f_fixture_venue_name,
    allMetrics.f_goals_away,
    allMetrics.f_goals_home,
    allMetrics.f_league_country,
    allMetrics.f_league_id,
    allMetrics.f_league_round,
    allMetrics.f_league_season,
    allMetrics.f_lineups_0_formation,
    allMetrics.f_lineups_1_formation,
    allMetrics.f_score_fulltime_away,
    allMetrics.f_score_fulltime_home,
    allMetrics.f_teams_away_name,
    allMetrics.f_teams_home_name,
];

export const MetricXs: Metric[] = [
    allMetrics.c_timecode,
    allMetrics.c_total_goals,
    allMetrics.e_assist_name,
    allMetrics.e_player_name,
    allMetrics.e_team_name,
    allMetrics.f_fixture_referee,
    allMetrics.f_fixture_venue_name,
    allMetrics.f_league_round,
    allMetrics.f_league_season,
    allMetrics.e_comments,
    allMetrics.e_detail,
];

export const MetricGs: Metric[] = [
    allMetrics.e_team_name,
    allMetrics.f_fixture_referee,
    allMetrics.f_fixture_venue_name,
    allMetrics.f_league_season,
];
