import './App.css';
import { useQuery } from '@tanstack/react-query';

interface BookData {
  id: number;
  title: string;
  subTitle: string;
  author: string;
  publisher: string;
  description: string;
  coverImgUrl: string;
}

async function fetchData() {
  try {
    const response = await fetch('http://localhost:12345/book');
    if (!response.ok) {
      throw new Error('실패');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function App() {
  const {
    data: bookData = [],
    isLoading,
    error,
    isStale,
    isFetching,
    refetch,
  } = useQuery<BookData[], Error, string[]>({
    queryKey: ['books'],
    queryFn: fetchData,
    staleTime: 1000 * 5,
    select: (bookData) => bookData.map((book) => book.author),
  });

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>오류 발생: {error.message}</p>;

  return (
    <>
      <h1>tanstack query 실습</h1>
      <button disabled={isFetching} onClick={() => refetch()}>
        refetch
      </button>
      <div>데이터가 {isStale ? '상함' : '신선'}</div>
      <ul>
        {bookData.map((author: string) => (
          <li key={author}>{author}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
