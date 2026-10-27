import type { ApiClient } from '../shell-contract';
import { ratingStars, ratingText, reviewSummary } from '../reviews/reviews';
import { useLoad } from './load';

/**
 * The average and the count of reviews of a barbershop, or of one of its barbers, in gold. It is a
 * detail of the screen: while it loads, or if appointment-api cannot answer, nothing is shown.
 */
export function Rating({ api, barbershopId, barberId }: { api: ApiClient; barbershopId: string; barberId?: string }) {
  const [result] = useLoad(() => reviewSummary(api, barbershopId, barberId), [barbershopId, barberId], '');
  if (result.state !== 'ready') return null;
  const summary = result.data;
  return (
    <p className="bs-gold" aria-label={ratingText(summary)}>
      {summary.reviewCount > 0 && <span aria-hidden="true">{ratingStars(summary.averageRating)} </span>}
      {ratingText(summary)}
    </p>
  );
}
