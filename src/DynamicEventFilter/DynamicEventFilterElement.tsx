import type { JSX } from 'react';
import type * as Db from '../../data/db/dbTypes.ts';

export type EventKeyId = Db.EventId | null;
export type EventValId = string | null;

export interface DynamicEventFilter {
    'eventKey': EventKeyId;
    'eventVal': EventValId;
}

export interface EventKey {
    'id': EventKeyId;
    'name': string;
}

export interface EventVal {
    'id': EventValId;
    'name': string;
}

export interface DynamicEventFilterElementProps {
    'filter': DynamicEventFilter;
    'eventKeys': EventKey[];
    'eventVals': EventVal[];
    'onKeyChange': (value: string) => void;
    'onValChange': (value: string) => void;
    'onDelete': () => void;
}

export default function DynamicEventFilterElement ({ filter, eventKeys, eventVals, onKeyChange, onValChange, onDelete }: DynamicEventFilterElementProps): JSX.Element {
    return (
        <>
            <button className="filter-delete-button" onClick={onDelete}>x</button>
            <select className="filter-select-key" value={filter.eventKey || ''} onChange={(event) => {
                onKeyChange(event.target.value);
            }}>
                {
                    eventKeys.map((key) => <option className="filter-option-key" key={key.id} value={key.id || ''}>{key.name}</option>)
                }
            </select>
            <select className="filter-select-val" disabled={!filter.eventKey} value={filter.eventVal || ''} onChange={(event) => {
                onValChange(event.target.value);
            }}>
                {
                    eventVals.map((val) => <option className="filter-option-key" key={val.id} value={val.id || ''}>{val.name}</option>)
                }
            </select>
        </>
    );
}
