import { EventBusSrv, EventBusExtended } from 'src/packages/datav-core/src/data';

export const appEvents: EventBusExtended = new EventBusSrv();

export default appEvents;
