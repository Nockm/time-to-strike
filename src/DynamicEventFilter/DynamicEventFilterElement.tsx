import type { JSX } from 'react';
import type { DynamicEventFilter, EventKey, EventVal } from './dynamicEventFilter';

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
            <div>Restrict </div>
            <select value={filter.eventKey || ''} onChange={(event) => {
                onKeyChange(event.target.value);
            }}>
                {
                    eventKeys.map((key) => <option key={key.id} value={key.id || ''}>{key.name}</option>)
                }
            </select>
            <div> to </div>
            <select disabled={!filter.eventKey} value={filter.eventVal || ''} onChange={(event) => {
                onValChange(event.target.value);
            }}>
                {
                    eventVals.map((val) => <option key={val.id} value={val.id || ''}>{val.name}</option>)
                }
            </select>
            <button className="filter-button-delete" onClick={onDelete}>x</button>
        </>
    );
}
