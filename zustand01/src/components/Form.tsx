import { FormEvent, ChangeEvent } from 'react';
import useMemoStore from '../stores/memos';

const Form = () => {
  const { memo, setMemo, setMemos } = useMemoStore();

  const handleWriteMemo = (e: ChangeEvent<HTMLInputElement>) => {
    setMemo(e.target.value);
  };

  const handleAddMemo = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setMemos(memo);
    setMemo('');
  };
  return (
    <form onSubmit={handleAddMemo}>
      <input
        type="text"
        value={memo || ''}
        onChange={handleWriteMemo}
        placeholder="메모를 입력하세요"
      />
      <button type="submit">추가</button>
    </form>
  );
};

export default Form;
