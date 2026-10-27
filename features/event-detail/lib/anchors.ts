export const SECTION_IDS = {
  eventInfo: 'event-info',
  usersInfo: 'users-info',
  responsesInfo: 'responses-info',
  extractResponses: 'extract-responses',
} as const;

export function candidateAnchorId(candidateId: string): string {
  return `candidate-${candidateId}`;
}
