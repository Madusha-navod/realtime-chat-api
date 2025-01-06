export interface DomainEvent {
   eventOid: string;
   eventType: string;
   timestamp: string;
   payload: {
      dataUri: string;
   };
   metadata: {
      correlationOid: string;
      version: string;
   };
}
