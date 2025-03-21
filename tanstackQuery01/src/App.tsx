import { useEffect, useState } from 'react';
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
  // const [bookData, setBookData] = useState<BookData[]>([]);

  // const getData = async () => {
  //   try {
  //     const response = await fetch('http://localhost:12345/book');
  //     if (!response.ok) {
  //       throw new Error('실패');
  //     }
  //     const data: BookData[] = await response.json();
  //     setBookData(data);
  //     console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  // useEffect(() => {
  //   getData();
  // }, []);

  const {
    data: bookData = [],
    isLoading,
    error,
    isStale,
  } = useQuery<BookData[]>({
    queryKey: ['books'],
    queryFn: fetchData,
    staleTime: 1000 * 5,
  });

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>오류 발생: {error.message}</p>;

  return (
    <>
      <h1>tanstack query 실습</h1>
      <div>데이터가 {isStale ? '상함' : '신선'}</div>
      <ul>
        {bookData.map((book: BookData) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
