'use client';

import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceholderImages: ImagePlaceholder[] = data.placeholderImages;

export const getPlaceholderById = (id: string): ImagePlaceholder | undefined => {
  return PlaceholderImages.find(img => img.id === id);
};
