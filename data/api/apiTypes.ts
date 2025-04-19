import type { ValidHttpResponse } from './httpResponse';

export type TypedHttpResponse<Type> = ValidHttpResponse & {
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

interface GameFixture {
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

interface GameTeam {
    'id': number;
    'name': string;
    'logo': string;
    'winner': boolean;
}

export interface GameBase {
    'fixture': GameFixture;
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
        'home': GameTeam;
        'away': GameTeam;
    };
    'goals': {
        'home': number;
        'away': number;
    };
    'score': {
        'halftime': {
            'home': number;
            'away': number;
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

export interface GameEvent {
    'time': {
        'elapsed': number;
        'extra': null;
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
        'id': number;
        'name': string;
    };
    'type': string;
    'detail': string;
    'comments': null;
}

interface GameExtra {
    'events': GameEvent[];
    'lineups': { // eslint-disable-line @typescript-eslint/no-empty-object-type
    }[];
    'statistics': { // eslint-disable-line @typescript-eslint/no-empty-object-type
    }[];
    'players': { // eslint-disable-line @typescript-eslint/no-empty-object-type
    }[];
}

export type Game = GameBase & GameExtra;
