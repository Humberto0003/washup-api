export const QueueStatus = {
  WAITING: 'WAITING',
  WASHING: 'WASHING',
  DONE: 'DONE',
} as const;

export type QueueStatus = (typeof QueueStatus)[keyof typeof QueueStatus];

export const WashServiceType = {
  SIMPLE: 'Lavagem simples',
  COMPLETE: 'Lavagem completa',
  INTERNAL_CLEANING: 'Higienizacao interna',
  POLISHING: 'Polimento',
} as const;

export type WashServiceType = (typeof WashServiceType)[keyof typeof WashServiceType];

export const PriorityDirection = {
  UP: 'UP',
  DOWN: 'DOWN',
} as const;

export type PriorityDirection = (typeof PriorityDirection)[keyof typeof PriorityDirection];
