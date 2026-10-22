// Полки библиотеки. Пока настоящих текстов нет, пустые места показываются как «скоро».
// Когда появятся тексты, добавляйте их в `books` нужной полки (позже это станет коллекцией).
export interface Book {
  title: string;
  author: string;
  href?: string;
}

export interface Shelf {
  id: string;
  title: string;
  description: string;
  books: Book[];
  slots: number; // сколько пустых мест показать
}

export const shelves: Shelf[] = [
  {
    id: 'prose',
    title: 'Проза',
    description: 'Рассказы, повести и циклы.',
    books: [],
    slots: 5,
  },
  {
    id: 'poetry',
    title: 'Поэзия и песни',
    description: 'Баллады, стихи и песни народов мира.',
    books: [{ title: 'Прощание с козами', author: 'Народ Туманной равнины' }],
    slots: 4,
  },
  {
    id: 'chronicles',
    title: 'Хроники и изыскания',
    description: 'Трактаты, дневники экспедиций и заметки, написанные жителями мира.',
    books: [],
    slots: 6,
  },
  {
    id: 'bestiary',
    title: 'Бестиарий',
    description: 'Описания существ глазами тех, кто с ними сталкивался.',
    books: [],
    slots: 4,
  },
  {
    id: 'authors',
    title: 'Хронисты',
    description: 'Авторы внутри мира: исследователи, путешественники, орденские писари.',
    books: [],
    slots: 3,
  },
];
