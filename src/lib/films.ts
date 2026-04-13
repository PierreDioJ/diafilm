export interface Film {
  id: string
  title: string
  description: string
  year: number
  totalSlides: number
}

export const FILMS: Film[] = [
  {
    id: 'cheburashka',
    title: 'Чебурашка',
    description: 'Маленький зверёк ищет себе друзей',
    year: 1971,
    totalSlides: 12,
  },
  {
    id: 'kolobok',
    title: 'Колобок',
    description: 'Народная сказка о непослушном колобке',
    year: 1956,
    totalSlides: 10,
  },
  {
    id: 'snegurochka',
    title: 'Снегурочка',
    description: 'Сказка о снежной девочке',
    year: 1963,
    totalSlides: 14,
  },
  {
    id: 'repka',
    title: 'Репка',
    description: 'Дружная семья тянет большую репу',
    year: 1950,
    totalSlides: 8,
  },
  {
    id: 'zolushka',
    title: 'Золушка',
    description: 'Сказка о трудолюбивой девочке и хрустальном башмачке',
    year: 1958,
    totalSlides: 16,
  },
  {
    id: 'buratino',
    title: 'Буратино',
    description: 'Приключения деревянного мальчика',
    year: 1953,
    totalSlides: 11,
  },
]

export function getFilmById(id: string): Film | undefined {
  return FILMS.find((f) => f.id === id)
}
