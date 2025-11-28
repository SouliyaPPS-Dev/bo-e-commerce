import { create } from 'zustand';

interface ImageStore {
  selectImage: any | null;
  isUploading: boolean;
  setSelectImage: (image: any | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  clearImageState: () => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  selectImage: null,
  isUploading: false,
  setSelectImage: (image) => set({ selectImage: image }),
  setIsUploading: (isUploading) => set({ isUploading }),
  clearImageState: () =>
    set({ selectImage: null, isUploading: false }),
}));
