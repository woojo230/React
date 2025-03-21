import './App.css';
import { useInfiniteQuery } from '@tanstack/react-query';

interface MovieDataProps {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
}

interface PageProps {
  results: MovieDataProps[];
  total_pages: number;
}

async function fetchData({ pageParam = 1 }: { pageParam: number }) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageParam}&sort_by=vote_average.desc&without_genres=99,10755&vote_count.gte=200`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return { results: [], total_pages: 0 };
  }
}

function App() {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery<PageProps>({
      queryKey: ['movies'],
      queryFn: ({ pageParam }) => fetchData({ pageParam: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        return pages.length < lastPage.total_pages
          ? pages.length + 1
          : undefined;
      },
    });

  return (
    <>
      <h1>Tanstack Query 실습</h1>
      <ul>
        {data?.pages
          .flatMap((page) => page.results)
          .map((movie) => (
            <li key={movie.id}>{movie.title}</li>
          ))}
      </ul>
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? '로딩 중...' : '더 보기'}
      </button>
    </>
  );
}

export default App;
