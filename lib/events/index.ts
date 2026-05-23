import { EventEmitter } from "node:events";

export type EventTopic = "match-finished";

export type EventPayloads = {
  "match-finished": {
    competitionId: string;
    seasonId: string;
    matchId: string;
  };
};

class EventBus {
  private readonly emitter = new EventEmitter();

  on<TTopic extends EventTopic>(
    topic: TTopic,
    listener: (payload: EventPayloads[TTopic]) => void | Promise<void>,
  ) {
    this.emitter.on(topic, listener);

    return () => this.emitter.off(topic, listener);
  }

  emit<TTopic extends EventTopic>(topic: TTopic, payload: EventPayloads[TTopic]) {
    this.emitter.emit(topic, payload);
  }
}

export const eventBus = new EventBus();
