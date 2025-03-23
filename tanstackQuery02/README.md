# Tanstack-Query(React Query)

**서버 상태 관리 라이브러리**

- 서버로부터 데이터 가져오기, 데이터 캐싱, 캐시 제어 등 데이터를 쉽고 효율적으로 관리할 수 있는 라이브러리
- 대표적인 기능
  - 데이터 가져오기 및 캐싱(data caching)
  - 동일 요청의 중복 제거(Memoization)
  - 무한 스크롤, 페이지네이션 등의 성능 최적화
  - 네트워크 재연결, 요청 실패 등의 자동 갱신
  - 신선한 데이터 유지
  - 네트워크 재연결, 요청 실패 등의 자동 갱신

---

### 핵심 요소

##### 1. Query Client (쿼리 클라이언트)

- TanStack Query의 중앙 데이터 저장소 역할
- 모든 query 요청과 응답을 관리하고, 캐싱된 데이터를 보관
- QueryClientProvider를 사용해 앱 전체에서 TanStack Query 기능을 사용할 수 있도록 해주는 역할할

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={true} />
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

##### 2. Query Key (쿼리 키)

- 쿼리를 고유하게 식별하는 키
- 동일한 queryKey를 가지는 쿼리는 같은 데이터를 공유

```tsx
const { data } = useQuery({
  queryKey: ['books'],
  queryFn: fetchData,
});
```

- 'books'라는 키로 데이터를 캐싱
- 이후 같은 queryKey를 사용하는 쿼리는 API를 다시 호출하지 않고 캐싱된 데이터를 사용

##### 3. Query Function (쿼리 함수)

- 데이터 fetching 해오는 함수
- useQuery가 실행되면 queryFn이 호출

```tsx
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
```

##### 4. Query Cache (쿼리 캐시)

- queryKey를 기반으로 데이터를 저장하고 관리하는 곳
- 특정 시간이 지나면 캐시된 데이터를 자동으로 삭제하거나 갱신할 수 있음

##### 5. Background Fetching (백그라운드 데이터 가져오기)

- staleTime이 지나면 데이터를 다시 가져오지만, UI를 블로킹하지 않음
- 기존 데이터를 유지하면서 백그라운드에서 새로운 데이터를 요청

---

### 데이터 캐싱

- TanStack Query를 활용해서 데이터를 가져올 때는 항상 쿼리 키(queryKey)를 지정하게 됨.
- 해당 쿼리 키는 캐시된 데이터와 비교해 새로운 데이터를 가져올지, 캐시된 데이터를 사용할지 결정하는 기준이 됨.

---

### 코드분석

```tsx
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
```

- 데이터 fetching 해오는 함수

---

```tsx
function App() {
  const {
    data: bookData = [],
    isLoading,
    error,
    isStale,
    isFetching,
    refetch,
  } = useQuery<BookData[], Error, string[]>({
    queryKey: ['books'], // 데이터를 식별하는 키
    queryFn: fetchData, // 데이터를 가져오는 함수
    staleTime: 1000 * 5, // 5초 동안 데이터를 신선한 상태로 유지, 5초 후에는 상한 데이터가 됨
    select: (bookData) => bookData.map((book) => book.author), // author만 추출
  });
```

- queryKey: 데이터를 식별하는 고유한 키
- queryFn: 데이터를 가져오는 비동기 함수 (fetch 함수), 반드시 데이터를 반환하거나 오류를 던져야 함
- staleTime: 데이터가 신선한 상태로 유지되는 시간
- isLoading: 데이터 로딩 중인지 여부
- error: 요청 중 오류 발생 여부
- refetch: 데이터를 다시 가져오는 함수
- isFetching: 현재 데이터를 가져오는 중인지 여부
- isStale: 데이터가 오래되어 새로 가져올 필요가 있는지 여부
- select: fetching 해온 데이터를 변형, bookData의 author 값만 따로 반환

---

```tsx
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
```

- 데이터 패칭중일때 버튼 클릭 비활성화
- 버튼 클릭시 데이터 재요청
- 5초가 지나면 isStale 값이 false로 바뀜, 따라서 "데이터가 상함" 이라는 문구 출력
- select 매서드 사용해 변형한 데이터로 bookData.author 값만 배열형태로 저장되어 있음.

---

### 동작 흐름

#### 1. 컴포넌트가 처음 마운트됨

- useQuery()가 실행되면서 queryKey를 확인

- 만약 캐시에 저장된 데이터가 없다면, queryFn을 호출해서 API 요청을 보냄

#### 2. API 요청 후 응답을 받음

- 데이터를 queryCache에 저장

- UI가 업데이트되고, 데이터를 화면에 표시

#### 3. 캐싱 및 상태 관리

- staleTime 동안 데이터를 신선한 상태로 유지함

- cacheTime이 지나면 캐시 삭제

#### 4. 백그라운드 데이터 갱신

- staleTime이 지나면 자동으로 데이터를 다시 가져옴

- 기존 데이터는 유지하면서 백그라운드에서 새 데이터를 요청

- 사용자가 수동으로 refetch()를 호출할 수도 있음

---

### 캐싱 & 자동 갱신 동작 방식

- TanStack Query는 데이터를 효율적으로 관리하기 위해 **staleTime, cacheTime, refetchInterval**을 활용

1. staleTime (데이터 신선도 유지 시간)

```tsx
useQuery({
  queryKey: ['books'],
  queryFn: fetchData,
  staleTime: 1000 * 5, // 5초 동안 데이터를 신선한 상태로 유지
});
```

2. cacheTime (캐시 유지 시간)

- staleTime이 지나기 전에는 API 요청을 다시 보내지 않음
- 5초가 지나면 데이터가 stale(오래됨) 상태로 바뀜, 이후 리리렌더링이 발생할 때 자동으로 API 요청을 보냄

```tsx
useQuery({
  queryKey: ['books'],
  queryFn: fetchData,
  cacheTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
});
```

- 캐시가 5분 동안 유지
- 5분 내에 같은 queryKey를 요청하면 API 요청 없이 캐시된 데이터를 사용
- 5분이 지나면 캐시가 삭제되고, 다시 API 요청을 보내야 함

3. refetchInterval (주기적인 데이터 갱신)

```tsx
useQuery({
  queryKey: ['books'],
  queryFn: fetchData,
  refetchInterval: 1000 * 10, // 10초마다 데이터 새로고침
});
```

- 10초마다 자동으로 데이터를 갱신

---

### isFetching vs isLoading 차이점

- isLoading : 처음 데이터를 가져오는 중일 때 (useQuery 실행 후 첫 번째 요청)
- isFetching : 새로운 데이터를 가져오는 중일 때 (refetch() 호출 또는 자동 갱신)
- 즉, isLoading은 처음에만 true가 되고, 이후에는 isFetching이 true가 된다
