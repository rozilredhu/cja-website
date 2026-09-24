import type { HeritageArticle, HeritageTimelineEntry, GalleryItem } from "./types";

export const heritageIntro = {
  title: "Jats Heritage",
  hindiTitle: "जाट विरासत",
  lede:
    "A respectful introduction to who the Jats (Jāṭs / जाट) are — community overview, carefully phrased history, and how diaspora life in Canada continues the story.",
};

/** Structured sections for the Heritage landing page (original summary prose). */
export const heritageSections = {
  overview: {
    title: "Who are the Jats?",
    hindiLabel: "परिचय",
    paragraphs: [
      "The Jats (also spelled Jaat or Jatt; Hindi: जाट) are a large community with deep roots in the northwestern Indian subcontinent. They are traditionally associated with farming, rural life, and strong kinship networks that link villages, clans (gotras), and extended families.",
      "Today, people who identify as Jat live mainly in parts of northern India — including Punjab, Haryana, Rajasthan, and western Uttar Pradesh — and in regions of Pakistan such as Punjab and Sindh. Communities of Hindu, Sikh, and Muslim faith are all part of this wider story, reflecting the religious diversity of the region.",
      "Beyond South Asia, Jat families have built homes and careers across the diaspora, including Canada, the United Kingdom, the United States, and elsewhere. For many in Canada, that shared heritage is what brings people together through associations such as the Canadian Jats Association (CJA).",
    ],
    highlights: [
      {
        title: "Agrarian roots",
        body: "Farming, land stewardship, and village life have long shaped Jat identity and values of hard work and mutual support.",
      },
      {
        title: "Faith & region",
        body: "Hindu, Sikh, and Muslim Jat communities are found across northwestern India and Pakistan, with local languages and customs varying by place.",
      },
      {
        title: "Clan & kinship",
        body: "Gotra and family ties remain meaningful for many households — connecting people across villages, cities, and countries.",
      },
    ],
  },
  history: {
    title: "A brief history",
    hindiLabel: "इतिहास",
    paragraphs: [
      "Accounts of early Jat history draw on a mix of oral tradition, community memory, and scholarly research. Many traditions describe pastoral beginnings in the Indus valley region, followed by gradual settlement into settled farming as families moved into the Punjab and neighbouring plains over centuries. Exact origins are still discussed among historians; this page presents those views as traditions and accounts, not as settled fact.",
      "Over time, Jat communities became closely associated with agriculture and local landholding. In various periods they also appear in military and political life — as village defenders, soldiers, and, in some eras, as local leaders. These roles differed by region and century, and no single story fits every clan or district.",
      "Under colonial rule and into the modern era, many Jat families continued as cultivators while others entered the armed forces, public service, trade, and professional careers. The twentieth century brought partition, migration, education, and urban opportunity — reshaping where people lived without erasing the importance of shared culture and kinship.",
    ],
  },
  today: {
    title: "Today & the diaspora",
    hindiLabel: "आज और प्रवास",
    paragraphs: [
      "In India and Pakistan, Jat communities remain prominent in rural economies and are also well represented in cities, sports, the military, business, and public life. Younger generations often balance modern careers with respect for language, festivals, and family custom.",
      "In Canada, Jat families form part of the wider Indo-Canadian community. Many arrived for study, work, or family reunification and have put down roots especially in the Greater Toronto Area and other urban centres. CJA was formed in 2006 as a non-for-profit forum so members could meet, celebrate festivals such as Holi and Diwali, support newcomers, and pass culture on to the next generation.",
      "Heritage for CJA is living practice: gathering, mentoring newcomers, sharing knowledge, and keeping younger Canadians connected to their roots — while fully belonging in Canadian society.",
    ],
  },
  culture: {
    title: "Culture & community identity",
    hindiLabel: "संस्कृति",
    cards: [
      {
        title: "Festivals & gathering",
        body: "Holi, Diwali, and community galas are familiar ways families celebrate together — joy, colour, and hospitality across generations.",
      },
      {
        title: "Values often shared",
        body: "Hard work, honouring elders, supporting kin, and looking after newcomers are themes many Jat households recognise, whatever their faith.",
      },
      {
        title: "Language & home",
        body: "Punjabi, Hindi, Haryanvi, and other regional languages travel with families abroad — along with food, music, and stories from home.",
      },
      {
        title: "CJA’s role",
        body: "In Canada, CJA offers a welcoming space to network, celebrate, and keep cultural memory alive for members and their children.",
      },
    ],
  },
  attribution: {
    note: "Adapted from publicly available sources including Wikipedia (Jat people), summarized for this site.",
    href: "https://en.wikipedia.org/wiki/Jat_people",
    linkLabel: "Wikipedia: Jat people",
  },
};

export const heritageArticles: HeritageArticle[] = [
  {
    slug: "cja-founding",
    title: "Canadian Jats Association — founding",
    excerpt:
      "CJA was formed in 2006 as a common forum for Jat community members in Canada.",
    body: [
      "According to public About copy on draft.cjacanada.ca and cjacanada.com, CJA was formed in 2006 with the idea of having a common forum where members could meet, exchange views, and interact personally with other community members.",
      "The association provides opportunities to participate in social celebrations including Holi and Diwali, and to share cultural experiences among Indo-Canadians with roots in India.",
      "Today CJA continues that founding spirit — connecting families across Canada while honouring Jat heritage.",
    ],
  },
  {
    slug: "festivals-and-community",
    title: "Festivals and community life",
    excerpt:
      "Holi, Diwali, and social gatherings help connect families and newcomers.",
    body: [
      "Public CJA materials highlight Holi and Diwali festivals, social gatherings, and annual Gala events as ways members and families participate in community life.",
      "Vision copy emphasizes helping newcomers adapt to life in Canada and engage with the existing Jat community.",
      "These celebrations are one of the most visible ways heritage stays alive in the diaspora — open, joyful, and welcoming to the next generation.",
    ],
  },
];

export const heritageTimeline: HeritageTimelineEntry[] = [
  {
    id: "t-early",
    year: "Traditions",
    title: "Pastoral & agrarian beginnings",
    summary:
      "Community accounts and scholarship often describe early pastoral life in Indus-valley regions and a gradual shift to settled farming in the Punjab and neighbouring plains. Origins remain a matter of tradition and research, not a single settled narrative.",
  },
  {
    id: "t-medieval",
    year: "Medieval–early modern",
    title: "Farming communities take root",
    summary:
      "Over centuries, many Jat groups became closely linked with cultivation and local landholding, with clan networks spanning villages across northwestern India and what is now Pakistan.",
  },
  {
    id: "t-modern",
    year: "Colonial & modern era",
    title: "Agriculture, service & change",
    summary:
      "Into the modern period, Jat families continued as cultivators while many also served in the military and entered public and professional life. Migration, education, and urban opportunity reshaped where people live today.",
  },
  {
    id: "t-1",
    year: "2006",
    title: "Canadian Jats Association formed",
    summary:
      "CJA founded as a non-for-profit forum for the Jat community in Canada (public About copy).",
  },
  {
    id: "t-2",
    year: "Today",
    title: "400+ members and growing",
    summary:
      "Public About copy states CJA currently has over 400 members and continues to enroll new members regularly.",
  },
];

export const heritageGallery: GalleryItem[] = [
  {
    id: "hg-1",
    title: "Diwali community photos",
    kind: "photo",
    caption: "See public Diwali Drive album linked from Gallery.",
    album: "Heritage",
  },
  {
    id: "hg-2",
    title: "Holi community photos",
    kind: "photo",
    caption: "See public Holi Facebook album linked from Gallery.",
    album: "Heritage",
  },
];
