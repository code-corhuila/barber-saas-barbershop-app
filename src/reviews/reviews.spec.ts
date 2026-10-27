import { describe, expect, it } from 'vitest';
import type { ApiClient } from '../shell-contract';
import { ratingStars, ratingText, reviewSummary } from './reviews';

function recordingApi(paths: string[], answer: unknown): ApiClient {
  const get = (path: string) => { paths.push(path); return Promise.resolve(answer as never); };
  return { get, post: get, put: get, patch: get, delete: get } as ApiClient;
}

describe('reviews of a barbershop and of each barber (HU-APPT-005)', () => {
  it('reads only the summary of the barbershop, or of one barber, from appointment-api', async () => {
    const paths: string[] = [];
    const api = recordingApi(paths, { data: [], meta: {}, summary: { averageRating: 4.6, reviewCount: 12 } });

    const shop = await reviewSummary(api, 'b1');
    await reviewSummary(api, 'b1', 'p1');

    expect(shop).toEqual({ averageRating: 4.6, reviewCount: 12 });
    expect(paths).toEqual([
      '/api/v1/reviews?barbershopId=b1&limit=1',
      '/api/v1/reviews?barbershopId=b1&barberId=p1&limit=1',
    ]);
  });

  it('shows the average with one decimal and the number of reviews', () => {
    expect(ratingText({ averageRating: 4.6, reviewCount: 12 })).toBe('4.6 · 12 reseñas');
    expect(ratingText({ averageRating: 5, reviewCount: 1 })).toBe('5.0 · 1 reseña');
    expect(ratingText({ averageRating: 3.25, reviewCount: 4 })).toBe('3.3 · 4 reseñas');
  });

  it('says there are no reviews yet when there are none', () => {
    expect(ratingText({ averageRating: null, reviewCount: 0 })).toBe('Sin reseñas aún');
  });

  it('draws five stars filled up to the rounded average', () => {
    expect(ratingStars(4.6)).toBe('★★★★★');
    expect(ratingStars(4.4)).toBe('★★★★☆');
    expect(ratingStars(1)).toBe('★☆☆☆☆');
    expect(ratingStars(null)).toBe('☆☆☆☆☆');
  });
});
