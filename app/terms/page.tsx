export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">Kullanım Şartları</h1>

      <p>
        Bu platformu kullanarak aşağıdaki şartları kabul etmiş olursunuz. Senin
        Pazarın, kullanıcıların ikinci el ürünlerini alıp satabildiği aracılık
        hizmeti sunan bir platformdur.
      </p>

      <h2 className="text-xl font-semibold mt-6">Kullanıcı Sorumlulukları</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Bilgilerin doğru ve güncel olması</li>
        <li>Yasalara uygun ürün satışı</li>
        <li>Dolandırıcılık veya kötüye kullanımda bulunmamak</li>
        <li>Telif hakkına aykırı içerik yayınlamamak</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">İlan İçeriği</h2>
      <p>
        İlanların sorumluluğu tamamen kullanıcıya aittir. Platform uygunsuz,
        zararlı veya sahte ilanları kaldırma hakkını saklı tutar.
      </p>

      <h2 className="text-xl font-semibold mt-6">Ücretler</h2>
      <p>Komisyon ve hizmet ücretleri, platform tarafından güncellenebilir.</p>

      <h2 className="text-xl font-semibold mt-6">Sorumluluk Reddi</h2>
      <p>
        Platform; alıcı ve satıcı arasındaki anlaşmazlıklardan sorumlu değildir.
      </p>

      <p className="mt-4 text-sm text-slate-500">
        Bu şartları kabul etmiyorsanız platformu kullanmayı bırakmalısınız.
      </p>
    </div>
  );
}
