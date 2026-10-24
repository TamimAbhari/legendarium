// Полки библиотеки. Книги берутся из src/content/library/, поле `shelf` выбирает полку.
// `slots` — сколько пустых мест показать на полке, пока книг мало.
export interface Shelf {
  id: 'prose' | 'poetry' | 'chronicles' | 'bestiary' | 'authors';
  title: string;
  description: string;
  slots: number;
}

export const shelves: Shelf[] = [
  { id: 'prose', title: 'Проза', description: 'Рассказы, повести и циклы.', slots: 5 },
  { id: 'poetry', title: 'Поэзия и песни', description: 'Баллады, стихи и песни народов мира.', slots: 4 },
  { id: 'chronicles', title: 'Хроники и изыскания', description: 'Трактаты, дневники экспедиций и заметки жителей мира.', slots: 6 },
  { id: 'bestiary', title: 'Бестиарий', description: 'Существа мира глазами тех, кто с ними сталкивался.', slots: 4 },
  { id: 'authors', title: 'Хронисты', description: 'Авторы внутри мира: исследователи, путешественники, орденские писари.', slots: 3 },
];
