import axios from 'axios';
import type {
  NasaAssetResponse,
  NasaItem,
  NasaRawItem,
  NasaSearchResponse,
} from '../types/nasa.ts';

const api = axios.create({
  baseURL: 'https://images-api.nasa.gov',
  timeout: 15000,
});

// Topics fetched once and shared by the list and gallery views
export const TOPICS = ['apollo', 'mars', 'nebula', 'shuttle', 'saturn'];

let collectionCache: NasaItem[] | null = null;
const assetCache = new Map<string, string>();

function toItem(raw: NasaRawItem, topic: string): NasaItem | null {
  const d = raw.data[0];
  const thumb = raw.links?.find((l) => l.render === 'image')?.href;
  if (!d || !thumb) return null;

  return {
    nasaId: d.nasa_id,
    title: d.title,
    description: d.description ?? 'No description available.',
    center: d.center ?? 'Unknown',
    dateCreated: d.date_created,
    keywords: d.keywords ?? [],
    thumbnail: thumb,
    topic,
    photographer: d.photographer,
    location: d.location,
  };
}

async function searchTopic(topic: string): Promise<NasaItem[]> {
  const res = await api.get<NasaSearchResponse>('/search', {
    params: { q: topic, media_type: 'image', page_size: 40 },
  });
  return res.data.collection.items
    .map((raw) => toItem(raw, topic))
    .filter((item): item is NasaItem => item !== null);
}

// Loads all topics in parallel, removes duplicates, caches the result
export async function loadCollection(): Promise<NasaItem[]> {
  if (collectionCache) return collectionCache;

  const results = await Promise.all(TOPICS.map(searchTopic));
  const seen = new Set<string>();
  const merged: NasaItem[] = [];

  for (const item of results.flat()) {
    if (!seen.has(item.nasaId)) {
      seen.add(item.nasaId);
      merged.push(item);
    }
  }

  collectionCache = merged;
  return merged;
}

// Larger image for the detail view, falls back to the thumbnail
export async function getLargeImage(item: NasaItem): Promise<string> {
  const cached = assetCache.get(item.nasaId);
  if (cached) return cached;

  try {
    const res = await api.get<NasaAssetResponse>(
      `/asset/${encodeURIComponent(item.nasaId)}`
    );
    const hrefs = res.data.collection.items.map((i) => i.href);
    const url =
      hrefs.find((h) => h.includes('~medium.jpg')) ??
      hrefs.find((h) => h.includes('~orig.jpg')) ??
      item.thumbnail;
    assetCache.set(item.nasaId, url);
    return url;
  } catch {
    return item.thumbnail;
  }
}