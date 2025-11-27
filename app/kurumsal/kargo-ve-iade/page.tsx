// app/kurumsal/kargo-ve-iade/page.tsx
import Link from "next/link";

export default function KargoVeIadePage() {
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 text-sm text-slate-800 dark:text-slate-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Kargo ve İade Politikası
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Son güncelleme tarihi: 26.11.2025
        </p>
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p>
          Bu “Kargo ve İade Politikası”, Senin Pazarın platformu üzerinden
          yapılan alım–satım işlemlerinde geçerli genel kuralları açıklar. Senin
          Pazarın, kullanıcıların ikinci el ürünlerini listeleyip satabildiği
          bir <strong>ilan ve aracı hizmet platformudur</strong>; satılan
          ürünlerin sahibi ve asıl satıcısı, ilgili ilanı oluşturan
          kullanıcıdır.
        </p>

        <p>
          Platformu kullanan tüm <strong>alıcı ve satıcılar</strong>, bu
          politikayı okumuş ve kabul etmiş sayılır.
        </p>

        {/* 1. KARGO SÜRECİ */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            1. Kargo Süreci
          </h2>

          <div>
            <h3 className="text-sm font-semibold">
              1.1. Kargodan kim sorumlu?
            </h3>
            <p className="mt-1">
              Ürünün paketlenmesi, zamanında kargoya verilmesi ve kargo
              firmasıyla olan süreçten{" "}
              <strong>ilan sahibi satıcı sorumludur</strong>. Senin Pazarın,
              satıcı ve kargo firması arasındaki süreçte sadece{" "}
              <strong>
                mesajlaşma ve kayıtların tutulmasını sağlayan bir aracı
              </strong>{" "}
              konumundadır.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              1.2. “24 saatte kargo” etiketi olan ilanlar
            </h3>
            <p className="mt-1">
              Bazı ilanlarda <strong>“24 saatte kargo”</strong> rozeti
              görebilirsiniz. Bu rozetin anlamı:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Satıcı, siparişiniz onaylandıktan sonraki{" "}
                <strong>24 saat içinde</strong> ürünü kargoya vermeyi taahhüt
                etmiştir.
              </li>
              <li>
                Kargo teslim süresi, kargo firmasına ve alıcının bulunduğu şehre
                göre değişebilir. Bu rozet sadece{" "}
                <strong>kargoya verilme zamanını</strong> kapsar, teslim süresi
                garanti edilmez.
              </li>
            </ul>
            <p className="mt-1">
              Satıcı bu taahhüdü karşılayamazsa alıcı, mesajlaşma sistemi
              üzerinden satıcıyla iletişime geçebilir ve gerek görürse ilanı
              veya satıcıyı değerlendirme/raporlama hakkını kullanabilir.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">1.3. Kargo ücreti</h3>
            <p className="mt-1">
              Kargo ücretini kimin ödeyeceği (alıcı, satıcı, karşı ödemeli vb.)
              genellikle ilan açıklamasında belirtilir. İlanda aksi
              belirtilmedikçe, varsayılan olarak{" "}
              <strong>kargo ücretinin alıcıya ait olduğu</strong> kabul edilir.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">1.4. Paketleme ve hasar</h3>
            <p className="mt-1">
              Ürünlerin sağlam bir şekilde paketlenmesinden{" "}
              <strong>satıcı sorumludur</strong>. Kargo sırasında oluşan
              hasarlarda alıcı:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Teslim almadan önce, kargo görevlisiyle birlikte{" "}
                <strong>tutanak tutmalı</strong>,
              </li>
              <li>
                Mümkünse ürün ve kutunun fotoğraflarını çekerek satıcıya
                iletmelidir.
              </li>
            </ul>
            <p className="mt-1">
              Bu tür durumlarda Senin Pazarın, taraflar arasında iletişim
              kurulmasına yardımcı olur ancak kargo firması ile satıcı/alıcı
              arasındaki hukuki sorumluluklara taraf değildir.
            </p>
          </div>
        </section>

        {/* 2. İADE VE CAYMA HAKKI */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            2. İade ve Cayma Hakkı
          </h2>

          <div>
            <h3 className="text-sm font-semibold">
              2.1. Senin Pazarın’ın rolü
            </h3>
            <p className="mt-1">
              Senin Pazarın, satıcı adına ürün satışı yapan bir{" "}
              <strong>mağaza değil</strong>, kullanıcıların kendi aralarında
              alım–satım yapmasını sağlayan bir <strong>pazar yeri</strong>dir.
              Bu nedenle iade süreçleri ve koşulları, ilgili ürünün satıcısı ile
              alıcı arasındaki anlaşmaya göre şekillenir.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              2.2. İlan açıklaması ve iade koşulları
            </h3>
            <p className="mt-1">
              Satıcı, ürün ilanında <strong>iade kabul edip etmediğini</strong>,
              iade süresini ve varsa özel koşulları açıkça belirtmelidir.
              Örneğin:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>“İade yoktur.”</li>
              <li>“Sadece kargoda hasar durumunda iade kabul edilir.”</li>
              <li>
                “Ürünü teslim aldıktan sonra 2 gün içinde iade talebi
                oluşturabilirsiniz.”
              </li>
            </ul>
            <p className="mt-1">
              Alıcılar, satın alma işlemi öncesinde bu açıklamaları dikkatle
              okumalı ve gerekirse satıcıya soru sormalıdır.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              2.3. Ayıplı veya ciddi şekilde farklı ürün
            </h3>
            <p className="mt-1">
              Eğer ürün ilandaki açıklamadan{" "}
              <strong>önemli ölçüde farklı</strong> ise veya belirtilmeyen ağır
              kusurlar içeriyorsa, alıcı:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Önce satıcıyla mesajlaşma üzerinden iletişime geçmeli, durumu
                açıklamalı ve mümkünse fotoğraf/video paylaşmalıdır.
              </li>
              <li>
                Çözüme ulaşılamazsa ilanı{" "}
                <strong>rapor etme ve değerlendirme</strong> hakkını
                kullanabilir.
              </li>
            </ul>
            <p className="mt-1">
              Senin Pazarın, bu bildirimler doğrultusunda gerekli gördüğü
              ilanları inceleme, gizleme, askıya alma veya kapatma hakkını saklı
              tutar. Taraflar arasındaki hukuki uyuşmazlıklarda doğrudan taraf
              değildir.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              2.4. Hijyen ürünleri ve özel durumlar
            </h3>
            <p className="mt-1">
              İç giyim, kozmetik, kişisel bakım ürünleri, kulak içi kulaklık
              gibi bazı ürün gruplarında hijyen gerekçesiyle satıcılar{" "}
              <strong>iade kabul etmeyebilir</strong>. Bu gibi durumlar ilanda
              açıkça belirtilmelidir.
            </p>
          </div>
        </section>

        {/* 3. SİPARİŞ İPTALİ */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            3. Sipariş İptali
          </h2>

          <div>
            <h3 className="text-sm font-semibold">
              3.1. Kargoya verilmeden önce
            </h3>
            <p className="mt-1">
              Alıcı, sipariş oluşturulduktan sonra hiçbir aşamada iptal
              talebinde bulunamaz. Sipariş oluşturulduktan sonra süreç tamamen
              satıcı tarafından yürütülür ve ürün, ilan şartlarına uygun olarak
              alıcıya gönderilir. Alıcı yalnızca ürün kendisine ulaştıktan
              sonra, geçerli mevzuat kapsamında iade hakkını kullanabilir.
              Platform, ürün kargoya verilmeden önce veya sonra gerçekleşen
              iptal taleplerini kabul etmez ve işlem yapmaz.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              3.2. Kargoya verildikten sonra
            </h3>
            <p className="mt-1">
              Ürün kargoya verildikten sonra süreç, satıcı ile alıcı arasında
              belirlenen <strong>iade koşulları</strong> çerçevesinde
              değerlendirilir. İade durumunda kargo ücretinin kimin tarafından
              karşılanacağı, tarafların kendi anlaşmasına göre belirlenir.
            </p>
          </div>
        </section>

        {/* 4. DEĞERLENDİRME VE RAPORLAMA */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            4. Değerlendirme ve Raporlama
          </h2>
          <p>
            Alıcılar, alışveriş sonrası <strong>satıcıyı puanlayabilir</strong>{" "}
            ve yorum bırakabilir. Şüpheli, yanıltıcı veya dolandırıcılık amaçlı
            bir ilan/satıcı gördüğünüzde, <strong>“şüpheli ilan bildir”</strong>{" "}
            özelliğini kullanarak platform yönetimine bildirebilirsiniz.
          </p>
          <p>
            Gelen geri bildirimler, satıcı puanları ve raporlar; platform
            güvenliğini artırmak ve diğer kullanıcıları korumak amacıyla
            değerlendirilir.
          </p>
        </section>

        {/* 5. SORUMLULUK SINIRI */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            5. Platformun Sorumluluk Sınırı
          </h2>
          <p>
            Senin Pazarın, satıcı ve alıcıların buluştuğu bir{" "}
            <strong>aracı hizmet sağlayıcıdır</strong>. İlanlardaki bilgilerin
            doğruluğu, ürünlerin durumu, kargo süreci, iade ve ödeme
            anlaşmalarından <strong>ilanda yer alan satıcı sorumludur</strong>.
          </p>
          <p>
            Senin Pazarın, kullanıcılar arasındaki özel alım–satım
            sözleşmelerinin tarafı değildir; ancak ihlal, dolandırıcılık, kötü
            niyet gibi durumlarda hesabı kısıtlama, ilanları kaldırma ve gerekli
            gördüğü tedbirleri alma hakkını saklı tutar.
          </p>
        </section>

        {/* 6. GÜNCELLEMELER */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            6. Politika Güncellemeleri
          </h2>
          <p>
            Bu “Kargo ve İade Politikası” zaman zaman güncellenebilir.
            Güncellenmiş metin, Senin Pazarın üzerinde yayınlandığı tarihten
            itibaren geçerlidir. Platformu kullanmaya devam eden kullanıcılar,
            ilgili değişiklikleri kabul etmiş sayılır.
          </p>
        </section>

        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
          <p>
            <Link
              href="/iletisim"
              className="text-cyan-600 hover:underline dark:text-cyan-400"
            ></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
