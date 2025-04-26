export interface Item {
    'fill': string;
    'tooltipHeader': string;
    'tooltipLines': string[];
    'xvalue': string;
    'xvalueformatted': string;
    'yvalue': number;
}

export function getBlankItem (): Item {
    return {
        'fill': 'gray',
        'tooltipHeader': '',
        'tooltipLines': [],
        'xvalue': '',
        'xvalueformatted': '',
        'yvalue': 0,
    };
}
