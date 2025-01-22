export function getBanyakOrangMessage(banyakOrang: number) {
  if (banyakOrang > 0) {
    return `Terdeteksi ada ${banyakOrang} di dalam frame.`;
  } else {
    return 'Tidak ada orang terdeteksi.';
  }
}
