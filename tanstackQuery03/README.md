# Tanstack-Query(React Query)

### Infinity Scroll(무한 스크롤)

1. **인터페이스 정의**

```tsx
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
```

- 모든 데이터를 타입으로 지정하면 코드가 복잡해지고 유지보수가 어려워짐
- 사용하지 않는 데이터까지 타입을 지정할 필요가 없음
- 필요한 데이터만 타입 지정하면 된다

---

2. **데이터 패칭 함수 정의**

```tsx
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
```

- props의 기본값 설정

---

3. **useInfiniteQuery(useQuery 아님 주의)**

```tsx
const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
  useInfiniteQuery<PageProps>({
    queryKey: ['movies'],
    queryFn: ({ pageParam }) => fetchData({ pageParam: pageParam as number }),
    initialPageParam: 1, // 첫 페이지를 1로 설정
    getNextPageParam: (lastPage, pages) => {
      return pages.length < lastPage.total_pages ? pages.length + 1 : undefined;
    },
  });
```

---

4. **queryKey: ['movies']**

- React Query에서 데이터를 캐싱할 때 고유한 키
- 같은 queryKey를 가진 쿼리는 동일한 데이터를 공유함

---

5. **queryFn: ({ pageParam }) => fetchData({ pageParam: pageParam as number })**

- 데이터 패칭하는 함수
- { pageParam }은 현재 페이지 번호
- fetchData()를 호출할 때, pageParam을 number로 명시적 형변환

---

6. **initialPageParam: 1**

- 첫 페이지를 1로 설정

---

7. **getNextPageParam**

```tsx
getNextPageParam: (lastPage, pages) => {
  return pages.length < lastPage.total_pages ? pages.length + 1 : undefined;
};
```

- 다음 페이지 번호를 결정하는 로직
- lastPage.total_pages보다 현재 pages.length가 작으면 다음 페이지 존재
- 다음 페이지를 pages.length + 1로 반환

---

8. **useInfiniteQuery에서 반환된 값들**
   | 변수명 | 설명 |
   |--------|--------------------------------|
   | data | 불러온 모든 페이지 데이터 |
   | isFetchingNextPage | 다음 페이지를 가져오는 중인지 여부 (true/false) |
   | fetchNextPage() | 다음 페이지 요청 함수 |
   | hasNextPage | 다음 페이지가 있는지 여부 (true/false) |

---

9. **버튼 적용 코드**

```tsx
<button
  onClick={() => fetchNextPage()}
  disabled={!hasNextPage || isFetchingNextPage}
>
  {isFetchingNextPage ? '로딩 중...' : '더 보기'}
</button>
```

- 클릭하면 fetchNextPage() 실행해서 다음 페이지 가져오기
- hasNextPage === false면 더 이상 가져올 페이지가 없으므로 버튼 비활성화
- isFetchingNextPage === true면 로딩 중... 표시
