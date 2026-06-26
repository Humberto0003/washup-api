import { QueueStatus } from './enums';

export function calculateEtaMinutes(status: QueueStatus, position: number): number {
  if (status === QueueStatus.DONE) {
    return 0;
  }

  if (status === QueueStatus.WASHING) {
    return 15;
  }

  return position * 20 + 5;
}
