export default function BilgilendirmePage() {
  return (
    <div className="mx-auto max-w-3xl py-10 px-4 space-y-6 text-sm">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Alıcı & Satıcı Bilgilendirme
      </h1>

      {/* Genel açıklama */}
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        Senin Pazarın, alıcı ve satıcıları güvenli şekilde bir araya getirmeyi
        hedefleyen modern bir ikinci el pazar yeridir. Bu sayfa, hem alıcıların
        hem de satıcıların bilgilendirilmesi amacıyla hazırlanmıştır.
      </p>

      {/* Hizmet Bedeli */}
      <section className="space-y-3">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
          Hizmet Bedeli Bilgilendirmesi
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <p className="text-slate-700 dark:text-slate-300">
            Satıcılar için hizmet bedeli, ilanı platformda yayınlama ve güvenli
            iletişim & işlem altyapısını sağlama amacıyla alınır.
          </p>

          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              • 1000 TL ve altındaki ürünlerde hizmet bedeli: <b>%7</b>
            </li>
            <li>
              • 1000 TL üzeri ürünlerde hizmet bedeli: <b>%6</b>
            </li>
          </ul>

          <p className="text-slate-700 dark:text-slate-300">
            Bu tutar yalnızca satıcılardan alınır.
          </p>

          <div className="mt-3 rounded-xl border border-green-300 bg-green-50 p-3 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200 text-sm">
            <strong>Alıcılardan hiçbir hizmet bedeli alınmaz.</strong>
            Alıcılar yalnızca satın aldıkları ürünün fiyatını öder.
          </div>
        </div>
      </section>

      {/* Alıcı Bilgilendirme */}
      <section className="space-y-3">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
          Alıcı Bilgilendirme
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <p className="text-slate-700 dark:text-slate-300">
            • Ürün açıklamalarını dikkatle okuyun ve satıcıyla net iletişim
            kurun.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Ürün fotoğraflarının güncel olduğundan emin olun.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Platform üzerinden mesajlaşmak güvenliğiniz için önemlidir.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Alışveriş sırasında ek bir maliyet ödemezsiniz; sistem alıcılardan
            hizmet bedeli almaz.
          </p>
        </div>
      </section>

      {/* Satıcı Bilgilendirme */}
      <section className="space-y-3">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
          Satıcı Bilgilendirme
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <p className="text-slate-700 dark:text-slate-300">
            • Ürün açıklamasını doğru, eksiksiz ve dürüst bir şekilde yazın.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Net ve kaliteli fotoğraflar satış şansını artırır.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Ürün fiyatlandırmasını doğru yapmanız, daha hızlı satış sağlar.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Satış gerçekleştiğinde hizmet bedeli kesintisi işleme otomatik
            olarak yansır.
          </p>
        </div>
      </section>

      {/* Kargo & Güvenlik */}
      <section className="space-y-3">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
          Kargo & Güvenlik
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <p className="text-slate-700 dark:text-slate-300">
            • Kargo süreçleri tamamen alıcı ve satıcı arasındaki anlaşmaya
            bağlıdır.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Tanımadığınız kişilere ödeme/kapora göndermeyin.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            • Güvenli alışveriş için platform dışı iletişimden kaçının.
          </p>
        </div>
      </section>
    </div>
  );
}
