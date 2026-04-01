export const PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
];

export const ART_CATEGORIES = [
  'Batik Clothing',
  'Handloom Saree',
  'Folk Jewelry',
  'Ceramic',
  'Statues',
  'Sri Lankan Sculpture',
  'Wood Carving',
  'Cane Work',
  'Mats',
  'Hana Fiber Crafts',
  'Coconut Crafts',
  'Metal Craft',
  'Lacquer Work',
  'Folk Mural Painting',
  'Puppetry',
  'Drum Craft',
  'Rabana Making',
  'Traditional Masks',
  'Beeralu Lace',
  'Sesath Craft',
  'Palm Leaf Craft',
  'Ola Leaf Manuscripts',
  'Calabash Art',
  'Traditional Toy Making',
  'Horn Craft',
  'Gem & Traditional Jewelry Craft',
  'Pottery & Clay',
  'Other',
];

export const EVENT_TYPES = [
  'Workshop',
  'Exhibition',
  'Festival',
  'Competition',
  'Training',
  'Other',
];

export const DONATION_PURPOSES = [
  { value: 'general',            label: 'General Support'       },
  { value: 'artist-support',     label: 'Artist Support'        },
  { value: 'event-sponsorship',  label: 'Event Sponsorship'     },
  { value: 'preservation',       label: 'Heritage Preservation' },
  { value: 'education',          label: 'Education & Training'  },
];

export const USER_ROLES = {
  ARTIST: 'artist',
  ADMIN:  'admin',
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const PROVINCE_OPTIONS   = ['All Provinces', ...PROVINCES];
export const CATEGORY_OPTIONS   = ['All', ...ART_CATEGORIES];
export const EVENT_TYPE_OPTIONS = ['All Types', ...EVENT_TYPES];
export const STATUS_OPTIONS     = ['All Status', 'upcoming', 'ongoing', 'completed'];