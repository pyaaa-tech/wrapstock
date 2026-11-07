// Semua teks dalam video. Ubah di sini, kemudian render semula.
export const CONTENT = {
  intro: {
    word: 'Claude',
    tagline: 'Rakan AI untuk berfikir, menulis & membina',
  },

  models: {
    label: 'Keluarga Model Claude',
    title: 'Satu keluarga. Pelbagai kekuatan.',
    footer: 'Semua model · Konteks sehingga 1 juta token',
    speedLabel: 'Kelajuan',
    smartLabel: 'Kecerdasan',
    chip: '1 JUTA TOKEN KONTEKS',
    cards: [
      {
        name: 'Haiku', ver: '5.5', tag: 'Pantas & Jimat',
        desc: 'Respons sekelip mata untuk tugasan harian dan kerja berskala besar.',
        speed: 0.98, smart: 0.62, accent: '#5ED6C0', gem: 'sphere',
      },
      {
        name: 'Sonnet', ver: '5.5', tag: 'Seimbang & Bijak',
        desc: 'Laju dan berkebolehan untuk kod, ejen AI dan kerja harian.',
        speed: 0.84, smart: 0.8, accent: '#72A9FF', gem: 'torus',
      },
      {
        name: 'Opus', ver: '5.5', tag: 'Penaakulan Mendalam',
        desc: 'Untuk kerja kompleks, analisis teliti dan pengaturcaraan lanjutan.',
        speed: 0.66, smart: 0.93, accent: '#B48CFF', gem: 'ico',
      },
      {
        name: 'Fable', ver: '5.1', tag: 'Paling Berkebolehan',
        desc: 'Model terhebat untuk penaakulan tertinggi dan tugasan jangka panjang.',
        speed: 0.52, smart: 1.0, accent: '#F4B860', gem: 'crystal',
      },
    ],
  },

  pro: {
    label: 'Kelebihan pelan',
    title: 'Claude Pro',
    items: [
      { icon: 'bars', title: 'Lebih Banyak Penggunaan', sub: 'Had jauh lebih tinggi berbanding pelan percuma', accent: '#F4B860' },
      { icon: 'spark', title: 'Akses Model Premium', sub: 'Guna model Claude yang paling terkini', accent: '#EE8A63' },
      { icon: 'terminal', title: 'Claude Code', sub: 'Pembantu pengekodan terus di terminal', accent: '#F2A07E' },
      { icon: 'search', title: 'Projek & Penyelidikan', sub: 'Susun kerja dan kaji dengan lebih mendalam', accent: '#E9A85C' },
    ],
  },

  outro: {
    word: 'Claude',
    tagline: 'Fikir lebih dalam. Cipta lebih hebat.',
    url: 'claude.ai',
  },
};
