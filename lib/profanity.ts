// lib/profanity.ts

// Buraya zamanla listeyi genişletebilirsin.
// ÖNEMLİ: Küfürleri tam yazmak istemiyorsan,
// sansürlü (s*k, a*q) de tutabilirsin, kontrol mantığı aynı.
const bannedWords = [
  "orospu",
  "piç",
  "siktir",
  "amk",
  "aq",
  "ibne",
  "gerizekalı",
  "aptal",
  "salak",
  // buraya istediğin kadar ekle
];

// Basit normalizasyon: küçük harfe çevir
function normalize(text: string): string {
  return text.toLowerCase();
}

// Metindeki yasaklı kelimeleri döndürür
export function findBannedWords(text: string): string[] {
  const norm = normalize(text);
  const found: string[] = [];

  for (const word of bannedWords) {
    // kelime bazlı kontrol (boşluk, noktalama vs. izinli)
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    if (pattern.test(norm)) {
      found.push(word);
    }
  }

  // Tekrarları temizle
  return Array.from(new Set(found));
}

// Sadece true/false lazım olduğunda:
export function hasBannedWords(text: string): boolean {
  return findBannedWords(text).length > 0;
}
