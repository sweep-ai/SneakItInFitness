import type { ApplicationFormData } from '../data/applicationForm';
import { formatApplicationPayload } from './formatApplicationPayload';

export async function submitApplication(data: ApplicationFormData): Promise<void> {
  const response = await fetch('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formatApplicationPayload(data)),
  });

  if (!response.ok) {
    let message = 'Submission failed';
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Use default message when response body is not JSON.
    }
    throw new Error(message);
  }
}
