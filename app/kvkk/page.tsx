export default function KvkkPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">KVKK Aydınlatma Metni</h1>

      <p>
        Senin Pazarın olarak kişisel verilerinizi 6698 sayılı Kişisel Verilerin
        Korunması Kanunu (“KVKK”) kapsamında işliyoruz.
      </p>

      <h2 className="text-xl font-semibold mt-6">İşlenen Kişisel Veriler</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Kimlik verisi</li>
        <li>İletişim verisi</li>
        <li>Kullanıcı işlem verileri</li>
        <li>İlan ve görsel verileri</li>
        <li>Cihaz ve log kayıtları</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">İşleme Amaçları</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Üyelik ve profil oluşturma</li>
        <li>İlan yayınlama</li>
        <li>Alıcı-satıcı iletişimi</li>
        <li>Güvenlik ve dolandırıcılık önleme</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Haklarınız</h2>
      <p>
        KVKK’nın 11. maddesi kapsamında; verilerinize erişme, düzeltme, silme
        veya işleme karşı çıkma hakkına sahipsiniz.
      </p>

      <p className="mt-4">
        Talepler için: <strong>kvkk@seninpazarin.com</strong>
      </p>
    </div>
  );
}
