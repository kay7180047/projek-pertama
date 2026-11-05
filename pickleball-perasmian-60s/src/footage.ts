// Slot rakaman/gambar sebenar (pilihan). Letak fail dalam public/footage/ dan isi di sini.
// Contoh: C: {type: 'video', src: 'footage/perasmian.mp4', startFrom: 0}
// Jika kosong, babak guna grafik jenama sahaja (keadaan preview semasa).
export type Slot = {type: 'video' | 'image'; src: string; startFrom?: number} | undefined;
export const footage: Record<string, Slot> = {A: undefined, B: undefined, C: undefined, D: undefined, E: undefined, F: undefined, G: undefined};
