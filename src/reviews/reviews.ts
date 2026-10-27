import type { ApiClient } from '../shell-contract';

/**
 * The reviews belong to the appointment domain (appointment-service.yaml listReviews, DEC-APPT-11):
 * this app only reads their summary, through the shell client, to show it on the barbershop and on
 * each barber. barberId is the barber profile's id, the one the appointment was booked with.
 */
export interface ReviewSummary {
  /** One decimal; null without reviews. */
  averageRating: number | null;
  reviewCount: number;
}

/** GET /api/v1/reviews, public. limit=1: only the summary is read, not the reviews themselves. */
export async function reviewSummary(api: ApiClient, barbershopId: string, barberId?: string): Promise<ReviewSummary> {
  const query = new URLSearchParams({ barbershopId });
  if (barberId) query.set('barberId', barberId);
  query.set('limit', '1');
  const page = await api.get<{ summary: ReviewSummary }>(`/api/v1/reviews?${query}`);
  return page.summary;
}

export function ratingText(summary: ReviewSummary): string {
  if (summary.reviewCount === 0 || summary.averageRating === null) return 'Sin reseñas aún';
  const count = summary.reviewCount === 1 ? '1 reseña' : `${summary.reviewCount} reseñas`;
  return `${summary.averageRating.toFixed(1)} · ${count}`;
}

/** Five stars, filled up to the rounded average. */
export function ratingStars(average: number | null): string {
  const filled = average === null ? 0 : Math.min(5, Math.max(0, Math.round(average)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}
