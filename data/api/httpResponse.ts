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

function isBaseHttpResponse (obj: unknown): obj is BaseHttpResponse {
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

export type ErrorHttpResponse = BaseHttpResponse & {
    'errors': Record<string, string>;
};

export function isErrorHttpResponse (obj: unknown): obj is ErrorHttpResponse {
    return (
        isObject(obj) &&
        isBaseHttpResponse(obj) &&
        isObject(obj.errors) &&
        true
    );
}

export type ValidHttpResponse = BaseHttpResponse & {
    'errors': unknown[];
};

export function isValidHttpResponse (obj: unknown): obj is ValidHttpResponse {
    return (
        isObject(obj) &&
        isBaseHttpResponse(obj) &&
        (isArray(obj.errors) && obj.errors.length === 0) &&
        true
    );
}

export type HttpResponse = ErrorHttpResponse | ValidHttpResponse;
