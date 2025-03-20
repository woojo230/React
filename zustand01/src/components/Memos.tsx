import useMemoStore from '../stores/memos';

const Memos = () => {
  const { memos } = useMemoStore();
  return (
    <ul>
      {memos.map((memo) => {
        return <li key="memo">{memo}</li>;
      })}
    </ul>
  );
};

export default Memos;
