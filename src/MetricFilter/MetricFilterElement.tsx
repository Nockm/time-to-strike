import type { JSX } from 'react';
import type * as Db from '../../data/db/dbTypes.ts';

export const idNoSelection = '-- Select --';
export const displayNameNoSelection = '-- Select --';

export type KeyId = Db.EventId | '-- Select --';
export type ValId = string | null;

export interface Selected {
    'key': KeyId;
    'val': ValId;
}

export interface SelectableKey {
    'id': KeyId;
    'displayName': string;
}

export interface SelectableVal {
    'id': ValId;
    'displayName': string;
}

export interface MetricFilterProps {
    'selected': Selected;
    'keys': SelectableKey[];
    'vals': SelectableVal[];
    'onKeyChange': (value: string) => void;
    'onValChange': (value: string) => void;
    'onDelete': () => void;
}

export default function MetricFilter ({ selected, keys, vals, onKeyChange, onValChange, onDelete }: MetricFilterProps): JSX.Element {
    return (
        <>
            <button className="filter-delete-button" onClick={onDelete}>x</button>
            <select className="filter-select-key" value={selected.key || ''} onChange={(event) => {
                onKeyChange(event.target.value);
            }}>
                {
                    keys.map((key) => <option className="filter-option-key" key={key.id} value={key.id || ''}>{key.displayName}</option>)
                }
            </select>
            <select className="filter-select-val" disabled={!selected.key} value={selected.val || ''} onChange={(event) => {
                onValChange(event.target.value);
            }}>
                {
                    vals.map((val) => <option className="filter-option-key" key={val.id} value={val.id || ''}>{val.displayName}</option>)
                }
            </select>
        </>
    );
}
