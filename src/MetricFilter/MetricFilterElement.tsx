import type { JSX } from 'react';
import type * as Db from '../../data/db/dbTypes.ts';

export const idNoSelection = '-- Select --';
export const displayNameNoSelection = '-- Select --';

export type KeyId = Db.EventKey | '-- Select --';
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
            <div style={{
                'display': 'flex',
                'flexDirection': 'row',
                'placeItems': 'center',
            }}>
                <button onClick={onDelete}>x</button>
                <select value={selected.key || ''} onChange={(event) => {
                    onKeyChange(event.target.value);
                }}>
                    {
                        keys.map((key) => <option key={key.id} value={key.id || ''}>{key.displayName}</option>)
                    }
                </select>
                <select disabled={!selected.key} value={selected.val || ''} onChange={(event) => {
                    onValChange(event.target.value);
                }}>
                    {
                        vals.map((val) => <option key={val.id} value={val.id || ''}>{val.displayName}</option>)
                    }
                </select>
            </div>
        </>
    );
}
