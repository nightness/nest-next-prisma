import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventDto } from './sse.types';

@Injectable()
export class SseService {
  private userConnections = new Map<string, Set<string>>();
  private connectionEvents = new Map<string, Subject<any>>();
  private heartbeatInterval = 30000; // 30 seconds
  private logger = new Logger('EventsService');

  emitEventToAll(data: Omit<EventDto, 'timestamp'>) {
    const stringData = JSON.stringify({
      ...data,
      timestamp: new Date(),
    } as EventDto);
    this.logger.log(`Emitting event to all: ${JSON.stringify(data)}`);
    this.connectionEvents.forEach((events$) => {
      events$.next({ data: `${stringData}\n\n` });
    });
  }

  emitEventToUser(userId: string, data: Omit<EventDto, 'timestamp'>) {
    const stringData = JSON.stringify({
      ...data,
      timestamp: new Date(),
    } as EventDto);
    this.logger.log(`Emitting event to user ${userId}: ${stringData}`);
    const connectionIds = this.userConnections.get(userId);
    if (connectionIds) {
      connectionIds.forEach((connectionId) => {
        const eventSubject = this.connectionEvents.get(connectionId);
        eventSubject?.next({ data: `${stringData}\n\n` });
      });
    }
  }

  registerConnection(userId: string, connectionId: string): Observable<any> {
    const events$ = new Subject<any>();
    this.connectionEvents.set(connectionId, events$);

    let connections = this.userConnections.get(userId);
    if (!connections) {
      connections = new Set();
      this.userConnections.set(userId, connections);
    }
    connections.add(connectionId);

    this.logger.log(
      `Registered connection ${connectionId} for user ${userId}`,
      `Total connections: ${this.userConnections.size}`,
    );

    // Start a heartbeat for this specific connection
    const close$ = new Subject<void>();
    this.startHeartbeatForConnection(events$, close$);

    return events$.asObservable().pipe(takeUntil(close$));
  }

  private startHeartbeatForConnection(
    events$: Subject<any>,
    close$: Subject<void>,
  ) {
    interval(this.heartbeatInterval)
      .pipe(takeUntil(close$))
      .subscribe(() => {
        events$.next('❤️\n\n');
      });
  }

  unregisterConnection(userId: string, connectionId: string) {
    const close$ = new Subject<void>();
    close$.next();
    close$.complete();

    this.connectionEvents.get(connectionId)?.complete();
    this.connectionEvents.delete(connectionId);

    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }
}
