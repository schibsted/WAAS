import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import boliviainteligente from './boliviainteligente.jpg';
import grobelska from './grobelska.jpg';
import horvath from './horvath.jpg';
import jehly from './jehly.jpg';
import kukurudziak from './kukurudziak.jpg';
import tischler from './tischler.jpg';
import topuzoglu from './topuzoglu.jpg';

const images: Array<{
  src: ImageMetadata;
  author: string;
  origin: string;
  accentColor: string;
}> = [
  {
    src: boliviainteligente,
    author: 'BoliviaInteligente',
    origin: 'Unsplash',
    accentColor: '#361b2d',
  },
  {
    src: kukurudziak,
    author: 'Max Kukurudziak',
    origin: 'Unsplash',
    accentColor: '#514b3e',
  },
  {
    src: topuzoglu,
    author: 'Tansu Topuzoğlu',
    origin: 'Unsplash',
    accentColor: '#42382b',
  },
  {
    src: tischler,
    author: 'Geio Tischler',
    origin: 'Unsplash',
    accentColor: '#334749',
  },
  {
    src: grobelska,
    author: 'Mariola Grobelska',
    origin: 'Unsplash',
    accentColor: '#722a3d',
  },
  {
    src: horvath,
    author: 'Richard Horvath',
    origin: 'Unsplash',
    accentColor: '#832f28',
  },
  {
    src: jehly,
    author: 'Nicolas Jehly',
    origin: 'Unsplash',
    accentColor: '#40422e',
  },
];

export const getBackgroundImage = async () => {
  const { src, ...randomImage } =
    images[Math.floor(Math.random() * images.length)]!;

  const optimizedBackground = await getImage({
    src: src,
    quality: 80,
    format: 'avif',
  });

  return { src: optimizedBackground.src, ...randomImage };
};
