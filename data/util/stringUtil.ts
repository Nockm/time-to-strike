export function removePrefix (str: string, prefix: string): string {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length);
    }
    return str;
}

export function replaceAll (str: string, search: string, replacement: string): string {
    return str.split(search).join(replacement);
}

export function singularToPlural (singular: string): string {
    if (singular.endsWith('y')) {
        // Check if the character before 'y' is a consonant
        const charBeforeY = singular.charAt(singular.length - 2);
        if (![
            'a',
            'e',
            'i',
            'o',
            'u',
        ].includes(charBeforeY)) {
            return `${singular.slice(0, -1)}ies`;
        }
    }
    if (singular.endsWith('o')) {
        return `${singular}es`;
    }
    if (singular.endsWith('ch') || singular.endsWith('sh')) {
        return `${singular}es`;
    }
    if (singular.endsWith('f')) {
        return `${singular.slice(0, -1)}ves`;
    }
    if (singular.endsWith('fe')) {
        return `${singular.slice(0, -2)}ves`;
    }

    if (singular.endsWith('x')) {
        return `${singular}es`;
    }
    if (singular.endsWith('z')) {
        return `${singular}es`;
    }
    if (singular.endsWith('s')) {
        return `${singular}es`;
    }
    if (singular.endsWith('is')) {
        return `${singular.slice(0, -2)}es`;
    }
    if (singular.endsWith('us')) {
        return `${singular.slice(0, -2)}i`;
    }
    if (singular.endsWith('um')) {
        return `${singular.slice(0, -2)}a`;
    }
    if (singular.endsWith('on')) {
        return `${singular.slice(0, -2)}a`;
    }

    return singular;
}

export function toUppercaseFirstLetter (str: string): string {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}
