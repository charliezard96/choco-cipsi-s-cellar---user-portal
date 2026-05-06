export interface AromaProfile {
  id: string;
  name: string;
  group_name: string;
  subgroup_name: string | null;
  hex_color: string | null;
  icon_slug: string | null;
  description: string | null;
}

export interface Chocolate {
  id: string;
  name: string;
  percentage: string;
  origin: string;
  tastingNotes: string[];
  imageUrl: string;
  imageBars?: string;
  description: string;
  producer: string;
  producerId?: string;
  region?: string;
  harvestYear: string;
  logoUrl?: string;
}

export interface Producer {
  id: string;
  name: string;
  location: string;
  description: string;
  tags: string[];
  imageUrl: string;
  verified?: boolean;
  philosophy?: string;
  specialFeature?: string;
  founders?: string;
  logoUrl?: string;
}

export interface TastingEvent {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  venue_name: string | null;
  price: number | null;
  max_capacity: number | null;
  image_url: string | null;
  is_published: boolean;
}

export const CHOCOLATES: Chocolate[] = [
  {
    id: 'marou-78',
    name: 'Marou',
    percentage: '78%',
    origin: 'Ben Tre, Vietnam',
    tastingNotes: ['Acidic', 'Honey'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2x94fzDtPkTp8iNrqEI10JXBE7leya6Ae-5bY6HLYcBf5f8AFWnZNJKE_WS9rHI2F2ySDRLFpRmXyuJzL2i0VHg0RX1qX1Q-TRhKizg6THds_a2W_g-GH9YKjphdV9GCN0OgTQtD2T1Ex9iHo_t2ZvnfqqPpvNTc9EnTbSL7HIbjZOObWFu7Bqu2Cnv_DttutzS7npjhHYNFFESUoBSmisOPbnnrdNpdrwtKXRKgi1g5n2DMjrUcl0y3cSwbU7xG6Ri69gtJ78QXF',
    producer: 'Marou Faiseurs',
    harvestYear: '2023',
    description: 'A robust dark chocolate with a sharp acidity and lingering honey undertones, sourced from the fertile soil of Ben Tre.'
  },
  {
    id: 'pralus-75',
    name: 'Pralus',
    percentage: '75%',
    origin: 'Sambirano, Madagascar',
    tastingNotes: ['Red Fruit', 'Citrus'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1_GusgIOdoKopW6fk5TXnFTPmQVqhmGxW6g_uATDfsXEhg_Q9ab4_TXjP5_GaMSZ11QrtQSHwA0gYIdhJ914_C9WRg_r848Htq9NdoeYJsq2XOIMkp6k2ogcE-sOLuEmrI2rMKeYJ-QL4Eb4m9US0AYJpkx4JbZEtzDpMeADpqdAhdwCauQJBvXOTYsijnwaslhSRxTTqsqAHPcHjZFK6BD0unrBqXZlcOlnRIS-pYtBx_yMYqY07-q105YkuJMll0iXZaw1otrSH',
    producer: 'Pralus',
    harvestYear: '2022',
    description: 'Vibrant and zesty, this bar captures the essence of Madagascar berries.'
  },
  {
    id: 'amedei-70',
    name: 'Amedei',
    percentage: '70%',
    origin: 'Tuscany, Italy',
    tastingNotes: ['Woody', 'Tobacco'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo7_w4FXGnXO22n_eyBy5bNHQWCI-MrI_yKDUR1pnwbL3Ho7WxFv2vDiErW4IMsPxyPMtnHpNAzFwwCzRuDuJlVf497-UA2OcGD9opnxNo87z5rcbvK96kgjWlLHiXjwIlMY8Xmo0KtxblSlI-QoPoRz2oMfdQnnXbQc1Xaz_rRBM-ZMXQbjzu_MBpKjjXvGmEKcb5VJaxug2iaUkEoU2_okwWPAbgvEfMQiHpBIzqBHyLN3Fr0OTeQZ139uJ6bIgq3zCEVvV0f3Mf',
    producer: 'Amedei Toscana',
    harvestYear: '2023',
    description: 'An elegant Italian classic with deep woody notes and a velvety tobacco finish.'
  },
  {
    id: 'fruition-85',
    name: 'Fruition',
    percentage: '85%',
    origin: 'Cusco, Peru',
    tastingNotes: ['Floral', 'Plum'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2wgwW9jh4Ojd49DRL3R_5BHuPh4yp-94PzdIkl4IrQFpXw_RT6rjfTcUCLZSIzyycrFaMu1nOQ1e8qIg172EtEXNUM8yjp8Ihhj0DBjPxP2eccvQZORG0E3vqTIDoGcuh1wJMWTui569pSAAT-1ghpGwEo0k9uwi4FO1Fz67MFB0q_TDXZP6Hp-3XfQJJnhLYSY36TH_FGD67oAm1ummyBCUsWtQ_Z2kLBq-ezJdsMAIxOzgfyCLvQymU1VPQj_mkHRLx893RAQNI',
    producer: 'Fruition Chocolate Works',
    harvestYear: '2023',
    description: 'High intensity Peruvian cacao with delicate floral high notes.'
  },
  {
    id: 'qantu-70',
    name: 'Qantu',
    percentage: '70%',
    origin: 'Morropón, Peru',
    tastingNotes: ['Nuts', 'Creamy'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX_fmlLDUrEe1HCyDdETTUnmOhAyRPpohn1b4gD1ff4B4P2klhqpk643uQjr2dYr93pKsvSRvsQSAGJM9srFwmpEN8tBQXlZ5m7NrHZRdwx4QqsBMK4IyDS24RwKLtneg9niHdZwBXruZcxANWdA-xM_by5UyJ9SpkNEjPsWz1r2FqtkeCIILFwV5sdHONsiDqHxXJqImqRi7ovUE2emtkwvyQgQ4Y244DFOJANcClkjuAmk31DDB5JgtHb0G0oMepWjb6CirtDwHx',
    producer: 'Qantu Cacao',
    harvestYear: '2022',
    description: 'Smooth and buttery with a distinct roasted nut profile.'
  },
  {
    id: 'omnom-73',
    name: 'Omnom',
    percentage: '73%',
    origin: 'Reykjavik, Iceland',
    tastingNotes: ['Sea Salt', 'Burnt Sugar'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkSA3JrtBnFMUtyIES300_I9e4UVp4l_Y9JJRRBWc1hEcSkQD1Bcz1eiVQ7jD8LAsytM34dbYvcKUkTpz5YVntGVb6uTe36My95fEQBLXUwnrJALfmVIF2aOwYRpaU0oQqnP-_wQufXez9zIy5cybKEMZ7nbabyU4G14AKTM-iTR9b8pyDqU334DuCJeV1oFyPQCR8xiuyzpi1KnisHhCkF9uvrHYPkJzX_6s4i24G6Or-cjgFcPzN3mcQvfpZOL-iQgg_pOfL0B2z',
    producer: 'Omnom Chocolate',
    harvestYear: '2023',
    description: 'Experimental Nordic chocolate with surprising sea salt crystals.'
  },
  {
    id: 'michel-cluizel-67',
    name: 'Michel Cluizel',
    percentage: '67%',
    origin: 'Vila Gracinda, São Tomé',
    tastingNotes: ['Tropical', 'Spice'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXgQcpWHwjT-OwLPGFcRTIhiI-tqZFTS7P3VIdHehx0XjRkk7QGMxw84k_26VIZBPvWE83BYyssUaZe1-_P0iM5ywfOMWly9w0v8cOzqzxbymtN4Oh7meCU5FS0K_1H22DKNzh71Ms7mLNAXo723VFrwNTWK9Q7sEnOmGxTXsFPcankWzVGD8_SZxC7Whp9vJW3o-MRV8b6wBpyyRhl4sYlmxeO0v8owrW2ZyFceN66V79nI__oYfr6FMKs0_lNcInK51tzGLY_d3n',
    producer: 'Michel Cluizel',
    harvestYear: '2023',
    description: 'Complex and spicy with hints of overripe tropical fruits.'
  },
  {
    id: 'soma-82',
    name: 'Soma',
    percentage: '82%',
    origin: 'Toronto, Canada',
    tastingNotes: ['Earthy', 'Berry'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9nVgpU_eezO3BFN55m027wPRWI1-0F-9XeECQti29G5MVCzy5DZ-GtSqDYBmOSHMeBAKBATQbwnbOK1W4r-FyzMFchjn139ge2wdBapcDjdLZdKYYboj-8URAOaTCfb4fFRokh5XF2ljVAh5RJTSH2YNckaEptMNbepnWQeFDyRvCQWSipu1TAAryGy_rlwpOIWTmEsN36_-QW-6u7u_XplXqyySEOYyDmiUnPabst0Ig07Nc4qaFRQ4cp_Ry6yuHSZmKKJrnpeO2',
    producer: 'Soma',
    harvestYear: '2023',
    description: 'Deep and brooding with a bright berry finish.'
  }
];

export const PRODUCERS: Producer[] = [
  {
    id: 'akessons',
    name: "Åkesson's Organic",
    location: 'Madagascar',
    description: 'Pioneers of single-plantation chocolate, the Åkesson family manages the Bejofo Estate. Their bars are celebrated for the vibrant, red fruit acidity characteristic of the Sambirano Valley.',
    tags: ['Fruity', 'Organic', 'Estate Grown'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV26l9-hWCtkEOKoB9Ieg6G-hPbhMc7P003MTPABald8GtvM3Bkt1Kv2DDym-R5dKcR9zu5SyNzSX3KWBOI-SH1FeWVlymhGnJ6y610bmRyM5MOJnrcpvsk4m9H9r5NPeSO5llYB187xeuU8-nErOkhtqzng9GFamkg3fTNuixgB95bcpAQXogV-63nW0an6mg0bCQCeLIIAxBkAfH5X83mmr5m7-Xd2901-ekHQDMdSfkfCdFH5zH5_wNzczEnSPYQ5cWc1LAniiu',
    verified: true
  },
  {
    id: 'marou-maker',
    name: 'Marou Faiseurs',
    location: 'Vietnam',
    description: 'The first artisan chocolate maker in Vietnam, Marou sources beans from distinct provinces in the Mekong Delta, creating complex bars that reflect the diverse soil.',
    tags: ['Artisanal', 'Direct Trade'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtlrbGVpSzp0QKvaxnccyE9qpWGnYhuBj0wg1R9fWyypVAnqtJMHFnU_fVCXWajvPzMjjkMHVGgBrI0zbbdtq80y5urgLOLyvMJkHUCooDPwsyLn2HQ6yMQLGx8OwOfV1Es_sNfW62md8HtRy8-dwP1V7TvGIWvjBVXmq9pCHIC9YOQnOjrB3ayyoAFi-8p3T6a22KB8EtO1Hxy56cHAkvk3JJSwTEM7vbB61dLz6tHhmBXsaHBxwVfjFfUikL1UTGkkISl8Bz5HbQ'
  },
  {
    id: 'qantu-maker',
    name: 'Qantu Cacao',
    location: 'Peru',
    description: 'Specializing in white cacao from the Piura region, Qantu focuses on floral and nutty profiles that highlight the delicate genetics of ancient Peruvian strains.',
    tags: ['Rare Cacao', 'Award Winning'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1l8QGtuGFoQkfiI2wObYBsXY6FsCB5FnN7fPwmKB7odr6jaAv3m-MQnYtA7ccoyFlkWmBcQgZSeZ_xEcf3B2sqpG3lfc5Zl82uRUB98TcSIH5KWtEj4h1GWtLv3CuYy2RAspTBMHgDAO16jp8kYo9-QwNSqm-nCemKFhBOq1VtDkIjyfTtE2WHONQKMpIIpf2nZ8azcGxPEzhPEEbNBFB3vCuUj383Fimd4sfq27tCRbnwvLsl7VxQ6XSWJB4GGB8eueiO9MN1vG7'
  },
  {
    id: 'omnom-maker',
    name: 'Omnom Chocolate',
    location: 'Iceland',
    description: 'Based in Reykjavik, Omnom combines unconventional Nordic ingredients with ethical bean sourcing. Their approach blends artistic packaging with rigorous technical execution.',
    tags: ['Experimental', 'Nordic'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCziUIMfItfqC8iM4TCFoJW_j_-p_AGQ0hlGZc4LqXKMaS8ce16V2ZJYIYqKBNTrSqndvbeROBRceAE0Z8-1KtU6irkm5vAN_QVRuXqtuuVtj7hpVLBlhchhRVKbN18KuQWtG1NxoOQMuZ1zEoKXAalEMpLLTw-6RU1_OkemDPMchduEYVohPtOG8Kh-FDsF6kFv8dsQ3TgoWmai-Blm32QxOLhHiybyHLw7iawCBTo70mXGDo2bXXc3ITdMFRCQkj9yRmHfBx55uK'
  }
];

export const EVENTS: TastingEvent[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    created_at: new Date().toISOString(),
    title: 'Single Origin: Madagascar Vertical',
    description: 'A deep dive into the diverse flavor profiles of Malagasy cacao across different estates.',
    event_date: '2024-10-12T18:00:00Z',
    location: 'Paris, France',
    venue_name: 'The Library Atelier',
    price: 85.00,
    max_capacity: 20,
    image_url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800&auto=format&fit=crop',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    created_at: new Date().toISOString(),
    title: 'Experimental Lab: Botanical Infusions',
    description: 'Exploring how floral and herbal infusions interact with high-percentage dark chocolate.',
    event_date: '2024-10-28T20:00:00Z',
    location: 'Online',
    venue_name: 'Virtual Studio',
    price: 45.00,
    max_capacity: 50,
    image_url: 'https://images.unsplash.com/photo-1623594191398-e7e0e29b46e3?q=80&w=800&auto=format&fit=crop',
    is_published: true
  }
];
