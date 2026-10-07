// Raw shapes returned by https://images-api.nasa.gov

export interface NasaRawData {
  nasa_id: string;
  title: string;
  description?: string;
  center?: string;
  date_created: string;
  keywords?: string[];
  media_type: string;
  photographer?: string;
  location?: string;
}

export interface NasaRawLink {
  href: string;
  rel: string;
  render?: string;
}

export interface NasaRawItem {
  href: string;
  data: NasaRawData[];
  links?: NasaRawLink[];
}

export interface NasaSearchResponse {
  collection: {
    items: NasaRawItem[];
    metadata: { total_hits: number };
  };
}

export interface NasaAssetResponse {
  collection: {
    items: { href: string }[];
  };
}

// Flattened item used everywhere in the app

export interface NasaItem {
  nasaId: string;
  title: string;
  description: string;
  center: string;
  dateCreated: string;
  keywords: string[];
  thumbnail: string;
  topic: string;
  photographer?: string;
  location?: string;
}