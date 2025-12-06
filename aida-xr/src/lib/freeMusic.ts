// Music library - with local overrides

export interface FreeTrack {
  id: string
  title: string
  artist: string
  genre: string
  bpm: number
  url: string
  tags: string[]
}

const proxyUrl = (url: string) => `/api/audio?url=${encodeURIComponent(url)}`

export const FREE_MUSIC_LIBRARY: FreeTrack[] = [
  {
    id: 'house-test',
    title: 'House Test (MP3)',
    artist: 'SoundHelix',
    genre: 'house',
    bpm: 124,
    url: proxyUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
    tags: ['house', 'test', 'mp3']
  },
  {
    id: 'stayin-alive',
    title: "Stayin' Alive",
    artist: 'Bee Gees',
    genre: 'disco',
    bpm: 104,
    url: '/BeeGees.mp4',
    tags: ['stayin', 'alive', 'bee', 'gees', 'disco', 'classic']
  },
  {
    id: 'another-one-bites-the-dust',
    title: 'Another One Bites the Dust',
    artist: 'Queen',
    genre: 'rock',
    bpm: 110,
    url: '/Queen.mp4',
    tags: ['another', 'one', 'bites', 'dust', 'queen', 'rock', 'classic']
  },
  {
    id: 'world-burn',
    title: "I'd Let The World Burn",
    artist: 'David Kushner',
    genre: 'electronic',
    bpm: 128,
    url: '/burn.mp4',
    tags: ['world', 'burn', 'intense', 'drop', 'electronic']
  },
  {
    id: 'hoodtrap',
    title: 'Hoodtrap / Mylancore Remix',
    artist: 'DJ AIDA',
    genre: 'trap',
    bpm: 140,
    url: proxyUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
    tags: ['hoodtrap', 'mylancore', 'remix', 'trap', 'bass', 'hard']
  },
  {
    id: 'house',
    title: 'House Groove',
    artist: 'DJ AIDA',
    genre: 'house',
    bpm: 124,
    url: proxyUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
    tags: ['house', 'deep', 'dance', 'club']
  },
  {
    id: 'techno',
    title: 'Techno Drive',
    artist: 'DJ AIDA',
    genre: 'techno',
    bpm: 130,
    url: proxyUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
    tags: ['techno', 'dark', 'driving', 'club']
  },
]

export function searchTracks(query: string): FreeTrack[] {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, '') // Remove special chars for better matching
  
  return FREE_MUSIC_LIBRARY.filter(t => {
    const title = t.title.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    const artist = t.artist.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    
    return title.includes(q) || 
           artist.includes(q) ||
           t.tags.some(tag => q.includes(tag))
  })
}

export function getBestMatch(query: string): FreeTrack | null {
  return searchTracks(query)[0] || null
}
