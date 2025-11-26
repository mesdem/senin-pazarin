export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">Gizlilik Politikası</h1>

      <p>
        Bu Gizlilik Politikası, Senin Pazarın (“Platform”) tarafından toplanan
        kişisel verilerin nasıl kullanıldığını, saklandığını ve korunduğunu
        açıklar.
      </p>

      <h2 className="text-xl font-semibold mt-6">Toplanan Veriler</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Ad, soyad, kullanıcı adı</li>
        <li>E-posta adresi</li>
        <li>Profil bilgileri</li>
        <li>İlan içerikleri ve görseller</li>
        <li>Mesajlaşma verileri</li>
        <li>Cihaz ve kullanım bilgileri</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">
        Verilerin Kullanım Amaçları
      </h2>
      <p>Toplanan veriler şu amaçlarla işlenir:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Üyelik işlemleri</li>
        <li>İlan oluşturma/düzenleme</li>
        <li>Alıcı–satıcı iletişimi</li>
        <li>Güvenlik ve kötüye kullanım tespiti</li>
        <li>Bildirim gönderimi</li>
        <li>Platform geliştirme ve analiz</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Haklarınız</h2>
      <p>
        Kullanıcılar; verilerine erişim, düzeltme, silme ve işleme karşı çıkma
        haklarına sahiptir.
      </p>

      <p className="mt-4">
        Sorular için: <strong>destek@seninpazarin.com</strong>
      </p>
    </div>
  );
}
