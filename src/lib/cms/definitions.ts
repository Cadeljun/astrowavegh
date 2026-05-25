export interface CMSField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url'
  placeholder?: string
  maxLength?: number
  hint?: string
}

export interface CMSSection {
  key: string
  label: string
  fields: CMSField[]
}

export interface CMSPage {
  slug: string
  label: string
  icon: string
  sections: CMSSection[]
}

export const CMS_PAGES: CMSPage[] = [
  {
    slug: 'home',
    label: 'Home',
    icon: '🏠',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Top Label', type: 'text', placeholder: "AFRICA'S CREATIVE POWERHOUSE", maxLength: 60 },
          { key: 'heading', label: 'Main Heading', type: 'text', placeholder: 'ASTROWAVE', maxLength: 40 },
          { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Vibes Beyond the Horizon.', maxLength: 80 },
          { key: 'cta1', label: 'Button 1 Text', type: 'text', placeholder: 'EXPLORE EVENTS', maxLength: 30 },
          { key: 'cta2', label: 'Button 2 Text', type: 'text', placeholder: 'OUR STORY', maxLength: 30 }
        ]
      },
      {
        key: 'about_teaser',
        label: 'About Teaser Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'OUR STORY', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'A Movement, Not Just A Brand.', maxLength: 60 },
          { key: 'body', label: 'Body Text', type: 'textarea', placeholder: 'AstroWave is a creative force...', maxLength: 300 },
          { key: 'cta', label: 'CTA Button Text', type: 'text', placeholder: 'DISCOVER ASTROWAVE →', maxLength: 40 }
        ]
      },
      {
        key: 'ecosystem',
        label: 'Ecosystem Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'WHAT WE DO', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'THE ASTROWAVE ECOSYSTEM', maxLength: 60 },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Four divisions. One unstoppable wave.', maxLength: 80 }
        ]
      },
      {
        key: 'events',
        label: 'Events Teaser Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'EXPERIENCES', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'UPCOMING EVENTS', maxLength: 60 },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Step into the wave.', maxLength: 80 }
        ]
      },
      {
        key: 'talent',
        label: 'Talent Teaser Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'OUR ROSTER', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'THE TALENT', maxLength: 60 },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'The faces behind the wave.', maxLength: 80 }
        ]
      },
      {
        key: 'cta_banner',
        label: 'CTA Banner Section',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'READY TO WAVE?', maxLength: 50 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: "Whether you're an artist, event lover, or brand...", maxLength: 200 },
          { key: 'cta1', label: 'Button 1 Text', type: 'text', placeholder: 'BOOK AN EVENT', maxLength: 30 },
          { key: 'cta2', label: 'Button 2 Text', type: 'text', placeholder: 'JOIN THE MOVEMENT', maxLength: 30 }
        ]
      }
    ]
  },
  {
    slug: 'about',
    label: 'About',
    icon: 'ℹ️',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Top Label', type: 'text', placeholder: 'WHO WE ARE', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'THE WAVE BEGINS HERE.', maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'Born in Accra. Built for Africa...', maxLength: 150 }
        ]
      },
      {
        key: 'story',
        label: 'Brand Story Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'OUR STORY', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'From a Vision To a Movement.', maxLength: 60 },
          { key: 'para1', label: 'Paragraph 1', type: 'textarea', placeholder: 'AstroWave was founded by...', maxLength: 400 },
          { key: 'para2', label: 'Paragraph 2', type: 'textarea', placeholder: 'The brand was built to solve...', maxLength: 400 },
          { key: 'para3', label: 'Paragraph 3', type: 'textarea', placeholder: 'AstroWave was created to change that...', maxLength: 400 },
          { key: 'quote', label: 'Founder Quote', type: 'textarea', placeholder: "WE'RE NOT JUST BUILDING A BRAND...", maxLength: 200 },
          { key: 'quoteAuthor', label: 'Quote Attribution', type: 'text', placeholder: '— Calvin Mensah Delali (Uzy), Founder', maxLength: 80 }
        ]
      },
      {
        key: 'vision',
        label: 'Vision & Mission Section',
        fields: [
          { key: 'visionTitle', label: 'Vision Card Title', type: 'text', placeholder: 'OUR VISION', maxLength: 40 },
          { key: 'visionBody', label: 'Vision Body', type: 'textarea', placeholder: "To become Africa's leading...", maxLength: 300 },
          { key: 'missionTitle', label: 'Mission Card Title', type: 'text', placeholder: 'OUR MISSION', maxLength: 40 },
          { key: 'missionBody', label: 'Mission Body', type: 'textarea', placeholder: 'To redefine entertainment by...', maxLength: 300 }
        ]
      },
      {
        key: 'values',
        label: 'Core Values Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'WHAT DRIVES US', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'OUR CORE VALUES', maxLength: 60 }
        ]
      }
    ]
  },
  {
    slug: 'events',
    label: 'Events',
    icon: '🎉',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Top Label', type: 'text', placeholder: 'LIVE EXPERIENCES', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'THE EVENTS', maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'Immersive. Energetic. Unforgettable.', maxLength: 150 }
        ]
      },
      {
        key: 'host_cta',
        label: 'Host CTA Section',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'WANT TO HOST WITH ASTROWAVE?', maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'Partner with us to create...', maxLength: 200 },
          { key: 'cta', label: 'Button Text', type: 'text', placeholder: 'GET IN TOUCH', maxLength: 30 }
        ]
      }
    ]
  },
  {
    slug: 'management',
    label: 'Management',
    icon: '👥',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Top Label', type: 'text', placeholder: 'TALENT & CAREERS', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'ASTROWAVE MANAGEMENT', maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: "We don't just manage talent...", maxLength: 200 },
          { key: 'cta', label: 'CTA Button Text', type: 'text', placeholder: 'JOIN OUR ROSTER', maxLength: 40 }
        ]
      },
      {
        key: 'services',
        label: 'Services Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'OUR SERVICES', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'WHAT WE OFFER', maxLength: 60 },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Everything a creative needs to grow.', maxLength: 100 }
        ]
      },
      {
        key: 'join',
        label: 'Join Roster Section',
        fields: [
          { key: 'label', label: 'Section Label', type: 'text', placeholder: 'WORK WITH US', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'JOIN THE ROSTER', maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'Think you have what it takes...', maxLength: 200 }
        ]
      }
    ]
  },
  {
    slug: 'contact',
    label: 'Contact',
    icon: '📬',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'label', label: 'Top Label', type: 'text', placeholder: 'GET IN TOUCH', maxLength: 40 },
          { key: 'heading', label: 'Heading', type: 'text', placeholder: "LET'S TALK.", maxLength: 60 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'Bookings, partnerships, talent inquiries...', maxLength: 200 }
        ]
      }
    ]
  },
  {
    slug: 'records',
    label: 'Records',
    icon: '🎵',
    sections: [
      {
        key: 'hero',
        label: 'Coming Soon Section',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'COMING SOON.', maxLength: 40 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'AstroWave Records is being built...', maxLength: 300 },
          { key: 'waitlistLabel', label: 'Waitlist Label', type: 'text', placeholder: 'BE THE FIRST TO KNOW', maxLength: 60 }
        ]
      }
    ]
  },
  {
    slug: 'cares',
    label: 'Cares',
    icon: '💛',
    sections: [
      {
        key: 'hero',
        label: 'Coming Soon Section',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', placeholder: 'IMPACT IS COMING.', maxLength: 40 },
          { key: 'subtext', label: 'Subtext', type: 'textarea', placeholder: 'AstroWave Cares is being built...', maxLength: 300 },
          { key: 'waitlistLabel', label: 'Waitlist Label', type: 'text', placeholder: 'STAY CONNECTED', maxLength: 60 }
        ]
      }
    ]
  }
]

export interface GlobalSettings {
  siteName: string
  tagline: string
  logoUrl: string
  logoDarkUrl: string
  logoIconUrl: string
  faviconUrl: string
  faviconSvgCode: string
  ogImageUrl: string
  ogImageHome: string
  ogImageAbout: string
  ogImageEvents: string
  ogImageManagement: string
  ogImageContact: string
  ogImageRecords: string
  ogImageCares: string
  ogImagePlatform: string
  brandGreen: string
  brandBlue: string
  brandSky: string
  brandBg: string
  email: string
  location: string
  instagram: string
  twitter: string
  tiktok: string
  youtube: string
  facebook: string
  heroVideoUrl: string
  heroPosterUrl: string
  heroImageUrl: string
  founderImageUrl: string
  defaultEventPoster: string
  defaultTalentPhoto: string
  defaultGalleryPhoto: string
  updatedAt?: any
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  siteName: 'AstroWave',
  tagline: 'Vibes Beyond the Horizon.',
  logoUrl: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png',
  logoDarkUrl: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png',
  logoIconUrl: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png',
  faviconUrl: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png',
  faviconSvgCode: '',
  ogImageUrl: '',
  ogImageHome: '',
  ogImageAbout: '',
  ogImageEvents: '',
  ogImageManagement: '',
  ogImageContact: '',
  ogImageRecords: '',
  ogImageCares: '',
  ogImagePlatform: '',
  brandGreen: '#00FF87',
  brandBlue: '#0EA5E9',
  brandSky: '#38BDF8',
  brandBg: '#020B18',
  email: 'info@astrowave.live',
  location: 'Accra, Ghana',
  instagram: 'https://instagram.com/astrowavegh',
  twitter: 'https://twitter.com/astrowavegh',
  tiktok: '',
  youtube: '',
  facebook: '',
  heroVideoUrl: '',
  heroPosterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200',
  heroImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200',
  founderImageUrl: '',
  defaultEventPoster: 'https://images.unsplash.com/photo-1514525253361-bee8a187449b?q=80&w=800',
  defaultTalentPhoto: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400',
  defaultGalleryPhoto: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800'
}
