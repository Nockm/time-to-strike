export interface Event {
    /* eslint-disable @typescript-eslint/naming-convention */
    'c_summary': string;
    'c_timecode': number;
    'e_assist_id': number | null;
    'e_assist_name': string | null;
    'e_comments': string;
    'e_detail': string;
    'e_player_id': number;
    'e_player_name': string;
    'e_team_id': number;
    'e_team_name': string;
    'e_time_elapsed': number;
    'e_time_extra': null | number;
    'e_type': string;
    'f_fixture_id': number;
    'f_fixture_referee': string;
    'f_league_country': string;
    'f_league_id': number;
    'f_league_round': string;
    'f_league_season': number;
    'f_teams_away_name': string;
    'f_teams_home_name': string;
    // 'team.logo': string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface Root {
    'events': Event[];
}
