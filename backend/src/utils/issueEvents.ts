import { EventEmitter } from 'events';

export const issueEvents = new EventEmitter();

// Allow multiple dashboard connections without warning
issueEvents.setMaxListeners(50);
