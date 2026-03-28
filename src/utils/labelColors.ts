// Label color mappings for Tailwind CSS classes
import type { LabelColor } from '../types';

export const LABEL_COLORS: Record<LabelColor, { bg: string; text: string; badge: string; name: string }> = {
  green:  { bg: 'bg-green-500',  text: 'text-white', badge: 'bg-green-500',  name: 'Green' },
  yellow: { bg: 'bg-yellow-400', text: 'text-black', badge: 'bg-yellow-400', name: 'Yellow' },
  orange: { bg: 'bg-orange-500', text: 'text-white', badge: 'bg-orange-500', name: 'Orange' },
  red:    { bg: 'bg-red-500',    text: 'text-white', badge: 'bg-red-500',    name: 'Red' },
  purple: { bg: 'bg-purple-500', text: 'text-white', badge: 'bg-purple-500', name: 'Purple' },
  blue:   { bg: 'bg-blue-500',   text: 'text-white', badge: 'bg-blue-500',   name: 'Blue' },
  sky:    { bg: 'bg-sky-400',    text: 'text-white', badge: 'bg-sky-400',    name: 'Sky' },
  lime:   { bg: 'bg-lime-500',   text: 'text-white', badge: 'bg-lime-500',   name: 'Lime' },
  pink:   { bg: 'bg-pink-500',   text: 'text-white', badge: 'bg-pink-500',   name: 'Pink' },
  black:  { bg: 'bg-gray-800',   text: 'text-white', badge: 'bg-gray-800',   name: 'Black' },
};

export const ALL_LABEL_COLORS = Object.keys(LABEL_COLORS) as LabelColor[];
