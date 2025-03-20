import { create } from 'zustand';

interface MemoStore {
  memo: string;
  setMemo: (text: string) => void;
  memos: string[];
  setMemos: (newMemo: string) => void;
}

const useMemoStore = create<MemoStore>((set) => ({
  memo: '',
  setMemo: (text) => set({ memo: text }),
  memos: [],
  setMemos: (newMemo) =>
    set((prev) => ({
      memos: [...prev.memos, newMemo],
    })),
}));

export default useMemoStore;
