import { createClient } from "@supabase/supabase-js";

// ------------------------------
// CONFIG — Buraya kendi değerlerini gir
// ------------------------------
const SUPABASE_URL = "https://dwcqjizrasfhyhdyxded.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3FqaXpyYXNmaHloZHl4ZGVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk3ODkxOCwiZXhwIjoyMDc5NTU0OTE4fQ.ocxRat4w_2EIMtkIewqsSvylcjSDP_lvZp5C8pc91Oo"; // önemli: anon key değil
// ------------------------------

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Rastgele şehir listesi
const cities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Konya",
  "Adana",
  "Gaziantep",
  "Kayseri",
  "Mersin",
  "Samsun",
  "Eskişehir",
  "Diyarbakır",
  "Malatya",
  "Trabzon",
];

// Gerçekçi Türk tam isimleri
const names = [
  "pazarci_mert",
  "limonkolonyasi",
  "turuncu_kedi",
  "oyuncu_aslan",
  "çilek",
  "satıcıKaya",
  "yenigibii",
  "sedaa",
  "buröz",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function createFakeUsers(count = 10) {
  for (let i = 1; i <= count; i++) {
    const fullName = randomItem(names);
    const city = randomItem(cities);

    const usernameBase = fullName.toLowerCase().replace(/ /g, "");
    const email = `${usernameBase}${Math.floor(Math.random() * 9999)}@test.com`;
    const password = "Test1234!";

    console.log(`→ Oluşturuluyor: ${fullName} (${email})`);

    // 1) Auth üzerinden kullanıcı oluştur
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError) {
      console.error("HATA:", userError.message);
      continue;
    }

    const userId = userData.user.id;

    // 2) Profiles tablosuna profil ekle
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      username: usernameBase,
      full_name: fullName,
      city: city,
      avatar_url: null,
    });

    if (profileError) {
      console.error("Profile HATASI:", profileError.message);
    } else {
      console.log(`✔ ${fullName} başarıyla oluşturuldu`);
    }
  }

  console.log("\n🎉 Tüm kullanıcılar başarıyla oluşturuldu!");
}

createFakeUsers(10);
