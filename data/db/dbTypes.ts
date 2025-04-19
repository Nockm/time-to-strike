export interface Event {
    /* eslint-disable @typescript-eslint/naming-convention */
    'assist.id': number | null;
    'assist.name': string | null;
    'comments': string;
    'detail': string;
    'fixtureId': number;
    'player.id': number;
    'player.name': string;
    'team.id': number;
    // 'team.logo': string;
    'team.name': string;
    'timecode': number;
    'summary': string;
    'time.elapsed': number;
    'time.extra': null | number;
    'type': string;
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface Root {
    'events': Event[];
}
