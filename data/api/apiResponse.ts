function isObject (value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isArray (value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function isObjectOrArray (value: unknown): value is unknown[] | Record<string, unknown> {
    return isObject(value) || isArray(value);
}

interface BaseHttpResponse {
    'get': 'status';
    'parameters': Record<string, string>;
    'results': number;
    'paging': {
        'current': number;
        'total': number;
    };
    'cached': boolean;
}

function isBaseResponse (obj: unknown): obj is BaseHttpResponse {
    return (
        isObject(obj) &&
        typeof obj.get === 'string' &&
        isObject(obj.parameters) &&
        typeof obj.results === 'number' &&
        isObject(obj.paging) &&
        typeof obj.paging.current === 'number' &&
        typeof obj.paging.total === 'number' &&
        isObjectOrArray(obj.response) &&
        true
    );
}

export type ValidResponse = BaseHttpResponse & {
    'errors': unknown[];
};

export function isValidResponse (obj: unknown): obj is ValidResponse {
    return (
        isObject(obj) &&
        isBaseResponse(obj) &&
        (isArray(obj.errors) && obj.errors.length === 0) &&
        true
    );
}
