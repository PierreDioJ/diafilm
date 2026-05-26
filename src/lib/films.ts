export interface Film {
  id: string
  title: string
  description: string
  year: number
  totalSlides: number
  folder: string
}

export const FILMS: Film[] = [
  {
    id: 'savrasov',
    title: 'А. К. Саврасов',
    description: 'Жизнь и творчество великого русского пейзажиста',
    year: 1970,
    totalSlides: 45,
    folder: 'А. К. Саврасов (1970)',
  },
  {
    id: 'biografiya-solntsa',
    title: 'Биография Солнца',
    description: 'Увлекательный рассказ о нашей звезде и Солнечной системе',
    year: 1983,
    totalSlides: 48,
    folder: 'Биография Солнца (1983)',
  },
  {
    id: 'gde-zhe-villi',
    title: 'Где же Вилли',
    description: 'Детский диафильм о приключениях и дружбе',
    year: 1980,
    totalSlides: 40,
    folder: 'Где же Вилли (1980)',
  },
  {
    id: 'detstvo-pushkina',
    title: 'Детство Пушкина',
    description: 'Ранние годы великого русского поэта',
    year: 1969,
    totalSlides: 55,
    folder: 'Детство Пушкина (1969)',
  },
  {
    id: 'na-vershinakh',
    title: 'На вершинах Ленинграда',
    description: 'Архитектурные и исторические памятники города на Неве',
    year: 1965,
    totalSlides: 50,
    folder: 'На вершинах Ленинграда (1965)',
  },
  {
    id: 'u-morya',
    title: 'У моря',
    description: 'Лирический рассказ о жизни у морского берега',
    year: 1974,
    totalSlides: 46,
    folder: 'У моря (1974)',
  },
]

export function getFilmById(id: string): Film | undefined {
  return FILMS.find((f) => f.id === id)
}
