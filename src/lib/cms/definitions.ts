// ─── CMS TYPES ──────────────────────────────────────────────────────────────

export interface CMSField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url';
  placeholder?: string;
  maxLength?: number;
  hint?: string;
}

export interface CMSSection {
  key: string;
  label: string;
  fields: CMSField[];
}

export interface CMSPage {
  id: string;
  slug: string;
  label: string;
  icon: string;
  route: string;
  sections: CMSSection[];
}

// ─── DEFAULT SETTINGS ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  siteName: 'AstroWave',
  tagline: 'Vibes Beyond the Horizon.',
  logoUrl: '/logo/astrowave-logo.svg',
  logoDarkUrl: '/logo/astrowave-logo-dark.svg',
  faviconUrl: '/favicon.svg',
  brandGreen: '#00C96B',
  brandBlue: '#0582FF',
  brandBg: '#020B18',
  email: 'astrowaveevent@gmail.com',
  location: 'Accra, Ghana',
  maintenanceMode: false
};

// ─── CMS PAGE DEFINITIONS ───────────────────────────────────────────────────

export const CMS_PAGES: CMSPage[] = [
  {
    id: 'home',
    slug: 'home',
    label: 'Home',
    icon: 'Home',
    route: '/',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'Ghana\'s #1 Entertainment Platform', maxLength: 50 },
          { key: 'heading', label: 'Main Heading', type: 'text', placeholder: 'VIBES BEYOND THE HORIZON', maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'AI-powered talent matching for Ghana\'s biggest events.', maxLength: 200 },
        ]
      },
      {
        key: 'marquee',
        label: 'Marquee Ticker',
        fields: [
          { key: 'items', label: 'Items (comma separated)', type: 'text', placeholder: 'DJ SET, LIVE BAND, MC HYPE, AFROBEATS', maxLength: 300, hint: 'Separate items with commas' },
        ]
      },
      {
        key: 'cta',
        label: 'Call to Action',
        fields: [
          { key: 'organizerHeading', label: 'Organizer Heading', type: 'text', placeholder: 'PLANNING AN EVENT?', maxLength: 40 },
          { key: 'organizerText', label: 'Organizer Text', type: 'textarea', placeholder: 'Post your brief and let our AI find the perfect talent.', maxLength: 200 },
          { key: 'talentHeading', label: 'Talent Heading', type: 'text', placeholder: 'ARE YOU A CREATIVE?', maxLength: 40 },
          { key: 'talentText', label: 'Talent Text', type: 'textarea', placeholder: 'Build your profile, earn your Wave Score, and get discovered.', maxLength: 200 },
        ]
      }
    ]
  },
  {
    id: 'about',
    slug: 'about',
    label: 'About',
    icon: 'Info',
    route: '/about',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'WHO WE ARE', maxLength: 30 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'THE WAVE BEGINS HERE.', maxLength: 50 },
          { key: 'subtext', label: 'Subtext', type: 'text', placeholder: 'Born in Accra. Built for Africa. Destined for the world.', maxLength: 100 },
        ]
      },
      {
        key: 'story',
        label: 'Our Story',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'OUR STORY', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'From a Vision To a Movement.', maxLength: 50 },
          { key: 'para1', label: 'Paragraph 1', type: 'textarea', placeholder: 'AstroWave was founded by Calvin Mensah Delali...', maxLength: 500 },
          { key: 'para2', label: 'Paragraph 2', type: 'textarea', placeholder: 'The brand was built to solve a real problem...', maxLength: 500 },
          { key: 'para3', label: 'Paragraph 3', type: 'textarea', placeholder: 'AstroWave was created to change that...', maxLength: 500 },
          { key: 'quote', label: 'Quote', type: 'textarea', placeholder: '"WE\'RE NOT JUST BUILDING A BRAND. WE\'RE BUILDING A GENERATION."', maxLength: 200 },
          { key: 'quoteAuthor', label: 'Quote Author', type: 'text', placeholder: '— Calvin Mensah Delali (Uzy), Founder', maxLength: 60 },
        ]
      },
      {
        key: 'vision',
        label: 'Vision & Mission',
        fields: [
          { key: 'visionTitle', label: 'Vision Title', type: 'text', placeholder: 'OUR VISION', maxLength: 20 },
          { key: 'visionBody', label: 'Vision Text', type: 'textarea', placeholder: 'To become Africa\'s leading creative powerhouse...', maxLength: 300 },
          { key: 'missionTitle', label: 'Mission Title', type: 'text', placeholder: 'OUR MISSION', maxLength: 20 },
          { key: 'missionBody', label: 'Mission Text', type: 'textarea', placeholder: 'To redefine entertainment by creating world-class events...', maxLength: 300 },
        ]
      },
      {
        key: 'values',
        label: 'Core Values',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'WHAT DRIVES US', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'OUR CORE VALUES', maxLength: 30 },
        ]
      }
    ]
  },
  {
    id: 'events',
    slug: 'events',
    label: 'Events',
    icon: 'Zap',
    route: '/events',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'Live & Upcoming', maxLength: 30 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'EVENTS', maxLength: 30 },
          { key: 'subtext', label: 'Subtext', type: 'text', placeholder: '0 events listed across Ghana', maxLength: 60 },
        ]
      },
      {
        key: 'cta',
        label: 'Bottom CTA',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'For Organizers', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'HOST YOUR EVENT WITH ASTROWAVE', maxLength: 50 },
          { key: 'text', label: 'Text', type: 'textarea', placeholder: 'List your event, access Ghana\'s top talent roster...', maxLength: 200 },
        ]
      }
    ]
  },
  {
    id: 'management',
    slug: 'management',
    label: 'Management',
    icon: 'Users',
    route: '/management',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'TALENT & CAREERS', maxLength: 30 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'ASTROWAVE MANAGEMENT', maxLength: 40 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'We don\'t just manage talent — we build legacies.', maxLength: 200 },
        ]
      },
      {
        key: 'services',
        label: 'Services',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'WHAT WE OFFER', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Everything a creative needs to grow.', maxLength: 50 },
        ]
      },
      {
        key: 'join',
        label: 'Join Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'WORK WITH US', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'JOIN THE ROSTER', maxLength: 30 },
          { key: 'text', label: 'Text', type: 'textarea', placeholder: 'Think you have what it takes to ride the wave?', maxLength: 200 },
        ]
      }
    ]
  },
  {
    id: 'records',
    slug: 'records',
    label: 'Records',
    icon: 'Music',
    route: '/records',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'RECORDS', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'COMING SOON.', maxLength: 30 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'AstroWave Records is being built to discover, develop, and amplify...', maxLength: 200 },
        ]
      }
    ]
  },
  {
    id: 'cares',
    slug: 'cares',
    label: 'Cares',
    icon: 'Heart',
    route: '/cares',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'CARES', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'IMPACT IS COMING.', maxLength: 30 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'AstroWave Cares is being built to empower youth...', maxLength: 200 },
        ]
      }
    ]
  },
  {
    id: 'contact',
    slug: 'contact',
    label: 'Contact',
    icon: 'Mail',
    route: '/contact',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Eyebrow Label', type: 'text', placeholder: 'GET IN TOUCH', maxLength: 20 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'LET\'S TALK.', maxLength: 30 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'Bookings, partnerships, talent inquiries — we\'re ready when you are.', maxLength: 100 },
        ]
      }
    ]
  },
];
