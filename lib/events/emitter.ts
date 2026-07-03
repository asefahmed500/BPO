export type EventType =
  | "requirement.submitted"
  | "requirement.approved"
  | "requirement.rejected"
  | "meeting.scheduled"
  | "meeting.completed"
  | "meeting.cancelled"
  | "message.sent"
  | "project.created"
  | "project.completed"
  | "user.role_changed"
  | "user.blocked"
  | "user.unblocked"
  | "user.registered"
  | "task.assigned"
  | "task.completed"
  | "goal.created"
  | "goal.completed";

export interface AppEvent {
  type: EventType;
  data: Record<string, any>;
  timestamp: Date;
  actorId?: string;
}

type EventHandler = (event: AppEvent) => void | Promise<void>;

class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();

  on(type: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  off(type: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(type);
    if (!handlers) return;
    this.handlers.set(
      type,
      handlers.filter((h) => h !== handler)
    );
  }

  async emit(type: EventType, data: Record<string, any>, actorId?: string): Promise<void> {
    const event: AppEvent = {
      type,
      data,
      timestamp: new Date(),
      actorId,
    };

    const handlers = this.handlers.get(type) || [];
    const wildcardHandlers = this.handlers.get("*" as EventType) || [];

    const allHandlers = [...handlers, ...wildcardHandlers];

    await Promise.allSettled(
      allHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${type}:`, err);
        }
      })
    );
  }
}

declare global {
  var _eventBus: EventBus | undefined;
}

export const eventBus = global._eventBus || (global._eventBus = new EventBus());
