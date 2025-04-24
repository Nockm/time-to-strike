import type { ValidResponse } from './apiResponse';

export type Response<Type> = ValidResponse & {
    'response': Type;
};

export interface Status {
    'account': {
        'firstname': string;
        'lastname': string;
        'email': string;
    };
    'subscription': {
        'plan': 'Free';
        'end': string;
        'active': boolean;
    };
    'requests': {
        'current': number;
        'limit_day': number; // eslint-disable-line @typescript-eslint/naming-convention
    };
}

interface Fixture {
    'id': number;
    'referee': string;
    'timezone': string;
    'date': string;
    'timestamp': number;
    'periods': {
        'first': number;
        'second': number;
    };
    'venue': {
        'id': number;
        'name': string;
        'city': string;
    };
    'status': {
        'long': string;
        'short': string;
        'elapsed': number;
        'extra': any;
    };
}

interface Team {
    'id': number;
    'name': string;
    'logo': string;
    'winner': boolean;
}

interface Player {
    'id': number;
    'name': string;
    'number': number | null;
    'pos': string;
    'grid': string | null;
}

export interface BaseFixtureInfo {
    'fixture': Fixture;
    'league': {
        'id': number;
        'name': string;
        'country': string;
        'logo': string;
        'flag': string;
        'season': number;
        'round': string;
        'standings': boolean;
    };
    'teams': {
        'home': Team;
        'away': Team;
    };
    'goals': {
        'home': number;
        'away': number;
    };
    'score': {
        'halftime': {
            'home': number;
            'away': string;
        };
        'fulltime': {
            'home': number;
            'away': number;
        };
        'extratime': {
            'home': any;
            'away': any;
        };
        'penalty': {
            'home': any;
            'away': any;
        };
    };
}

export interface Event {
    'time': {
        'elapsed': number;
        'extra': null | number;
    };
    'team': {
        'id': number;
        'name': string;
        'logo': string;
    };
    'player': {
        'id': number;
        'name': string;
    };
    'assist': {
        'id': number | null;
        'name': string | null;
    };
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    'type': string
        | 'Card'
        | 'Goal'
        | 'subst'
        | 'Var';
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    'detail': string
        | 'Card upgrade'
        | 'Goal cancelled'
        | 'Goal confirmed'
        | 'Normal Goal'
        | 'Own Goal'
        | 'Penalty cancelled'
        | 'Penalty confirmed'
        | 'Penalty'
        | 'Red card cancelled'
        | 'Red Card'
        | 'Substitution 1'
        | 'Substitution 2'
        | 'Substitution 3'
        | 'Substitution 4'
        | 'Substitution 5'
        | 'Substitution 6'
        | 'Yellow Card';
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    'comments':
        null
        | string
        | 'Argument'
        | 'Foul'
        | 'Handball'
        | 'Off the ball foul'
        | 'Persistent fouling'
        | 'Professional foul last man'
        | 'Simulation'
        | 'Time wasting'
        | 'Unallowed field entering'
        | 'Violent conduct';
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

export interface Lineup {
    'team': {
        'id': number;
        'name': string;
        'logo': string;
        'colors': {
            'player': {
                'primary': string;
                'number': string;
                'border': string;
            };
            'goalkeeper': {
                'primary': string;
                'number': string;
                'border': string;
            };
        };
    };
    'coach': {
        'id': number;
        'name': string;
        'photo': string;
    };
    'formation': string;
    'startXI': {
        'player': Player;
    }[];
    'substitutes': {
        'player': Player;
    }[];
}

interface ExtraFixtureInfo {
    'events': Event[];
    // 'lineups': { // eslint-disable-line @typescript-eslint/no-empty-object-type
    // }[];
    // 'statistics': { // eslint-disable-line @typescript-eslint/no-empty-object-type
    // }[];
    // 'players': { // eslint-disable-line @typescript-eslint/no-empty-object-type
    // }[];
    'lineups': Lineup[];
    'statistics': {
        'team': {
            'id': number;
            'name': string;
            'logo': string;
        };
        'statistics': {
            'type': string;
            'value': string | number;
        }[];
    }[];
    'players': {
        'team': {
            'id': number;
            'name': string;
            'logo': string;
            'update': string;
        };
        'players': {
            'player': {
                'id': number;
                'name': string;
                'photo': string;
            };
            'statistics': {
                'games': {
                    'minutes': number | null;
                    'number': number;
                    'position': string;
                    'rating': string | null;
                    'captain': boolean;
                    'substitute': boolean;
                };
                'offsides': number | null;
                'shots': {
                    'total': number | null;
                    'on': number | null;
                };
                'goals': {
                    'total': number | null;
                    'conceded': number;
                    'assists': number | null;
                    'saves': number | null;
                };
                'passes': {
                    'total': number | null;
                    'key': number | null;
                    'accuracy': string | null;
                };
                'tackles': {
                    'total': number | null;
                    'blocks': number | null;
                    'interceptions': number | null;
                };
                'duels': {
                    'total': number | null;
                    'won': number | null;
                };
                'dribbles': {
                    'attempts': number | null;
                    'success': number | null;
                    'past': number | null;
                };
                'fouls': {
                    'drawn': number | null;
                    'committed': number | null;
                };
                'cards': {
                    'yellow': number;
                    'red': number;
                };
                'penalty': {
                    'won': number | null;
                    'commited': number | null;
                    'scored': number | null;
                    'missed': number | null;
                    'saved': number | null;
                };
            }[];
        }[];
    }[];
}

export type FixtureInfo = BaseFixtureInfo & ExtraFixtureInfo;

import specimenFixtures from '../../test/api/resources/success__Fixtures__Id.json' with { 'type': 'json' };

const typeCheck: ExtraFixtureInfo[] = specimenFixtures.response;
if (typeCheck.length === 0) {
    console.log('Just to avoid no-unused-vars.');
}
