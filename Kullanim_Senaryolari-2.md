# Kullanım Senaryoları

---

## 📄 KULLANIM SENARYOSU 1 — Kilometre Verisi Girişi

**Birincil Aktör:** Dış Kaynak Firması Personeli  
**İlgililer ve Beklentileri:**  
- Firma: Araçların kullanım detaylarını takip etmek ister.  
- Dış kaynak: Verilerin zamanında girilmesini sağlar.  
**Ön Koşullar:** Araç Sistemde Tanımlı Olmalı, Aybaşı Olmalı  
**Son Koşullar:** Kilometre Verisi Kaydedilir ve Önceki Ay ile Kıyaslanabilir Olur  
**Ana Senaryo:**  
Aybaşı geldiğinde dış kaynak personeli her aracın güncel kilometre verisini sisteme girer. Bu veri, geçmiş ayki veriyle birlikte saklanır.  
**Alternatif Akış:**  
2.a Araç geçici olarak görevdeyse kullanıcı veriyi girer, dış kaynak onaylar.

---

## 📄 KULLANIM SENARYOSU 2 — Araç Tanımlama ve Bilgi Girişi

**Birincil Aktör:** Sistem Yöneticisi veya Dış Kaynak Firması Personeli  
**İlgililer ve Beklentileri:**  
- Firma: Filodaki tüm araçların eksiksiz sisteme tanımlanmasını ister.  
- Dış kaynak: Destek süreçleri için araç bilgilerine erişmek ister.  
**Ön Koşullar:** Araç kiralanmış ya da firmaya ait (özmal) olmalı, sistemde kayıtlı kullanıcı girişi yapılmış olmalı  
**Son Koşullar:** Araç bilgileri (plaka, marka, model, tür, kiralık/özmal, başlangıç km vb.) eksiksiz girilir ve sistemde aktif hale gelir  
**Ana Senaryo:**  
Yeni bir araç filoya dahil edildiğinde, sistem yöneticisi veya dış kaynak firması yetkilisi, araç bilgilerini sisteme tanımlar. Gerekli tüm alanlar doldurulur ve kayıt tamamlanır. Araç, görev atamaları ve raporlama işlemlerinde kullanılabilir hale gelir.  
**Alternatif Akış:**  
2.a Araç bilgileri eksikse sistem kayıt işlemine izin vermez, eksik alanlar kullanıcıya bildirilir.
---

## 📄 KULLANIM SENARYOSU 3 — Araç Görevlendirme ve Sürücü Atama

**Birincil Aktör:** Sistem Yöneticisi veya Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Görevler için uygun araç ve sürücü eşleştirmesi yapılmasını ister.  
- Çalışan: Kendisine atanmış aracı takip edebilmek ister.  
**Ön Koşullar:** Araç sistemde tanımlı ve aktif olmalı. Sürücü sistemde tanımlı kullanıcı olmalı.  
**Son Koşullar:** Seçilen araç bir göreve atanır, ardından uygun sürücüyle eşleştirilir. Bilgiler sistemde kayıt altına alınır.  
**Ana Senaryo:**  
Görev ihtiyacı oluştuğunda sistem yöneticisi ya da firma yetkilisi, uygun araç havuzundan bir aracı seçer ve bu araca bir görev atar. Ardından aracı kullanacak sürücü belirlenir ve sistemde atanır. Görevlendirme ve atanma bilgileri tarih, süre ve görev detayı ile birlikte kaydedilir.  
**Alternatif Akış:**  
2.a Atanacak sürücü sistemde kayıtlı değilse işlem tamamlanamaz, kullanıcıya uyarı verilir.  
2.b Araç o tarihte başka bir görevdeyse sistem çakışma uyarısı verir.

---

## 📄 KULLANIM SENARYOSU 4 — Bakım Kaydı Girişi

**Birincil Aktör:** Dış Kaynak Firması Personeli  
**İlgililer ve Beklentileri:**  
- Firma: Araçların periyodik bakım geçmişini izlemek ister.  
- Dış kaynak: Gerçekleşen bakımları doğru şekilde kaydetmekle yükümlüdür.  
**Ön Koşullar:** Araç sistemde tanımlı ve aktif olmalı. Bakım işlemi tamamlanmış olmalı.  
**Son Koşullar:** Bakım kaydı tarih, açıklama ve maliyet bilgisiyle birlikte sisteme işlenir.  
**Ana Senaryo:**  
Periyodik bakım sonrası dış kaynak personeli, bakım yapılan aracı seçerek işlem tarihini, açıklamasını ve varsa maliyetini sisteme girer.  
**Alternatif Akış:**  
2.a Araç bilgisi eksikse sistem kayıt yapılmasına izin vermez.

---

## 📄 KULLANIM SENARYOSU 5 — Lastik Değişimi Kaydı Girişi

**Birincil Aktör:** Dış Kaynak Firması Personeli  
**İlgililer ve Beklentileri:**  
- Firma: Lastik değişim sıklığını ve maliyetlerini izlemek ister.  
- Dış kaynak: Gerçekleşen değişimleri eksiksiz kaydetmek ister.  
**Ön Koşullar:** Araç sistemde tanımlı olmalı. Lastik değişimi yapılmış olmalı.  
**Son Koşullar:** Lastik değişim kaydı tarih, açıklama ve maliyet bilgileriyle sisteme eklenir.  
**Ana Senaryo:**  
Dış kaynak personeli, lastiği değişen aracı seçer ve işlem detaylarını sisteme girer.  
**Alternatif Akış:**  
2.a Tarih veya maliyet bilgisi girilmeden kayıt yapılmak istenirse sistem uyarı verir.

---
---

## 📄 KULLANIM SENARYOSU 6 — Parça Değişim (Kasko veya Ücretli) Kaydı Girişi

**Birincil Aktör:** Dış Kaynak Firması Personeli  
**İlgililer ve Beklentileri:**  
- Firma: Hangi parçaların değiştiğini ve maliyet kaynağını görmek ister.  
- Dış kaynak: Parça değişimini belgelemek ister.  
**Ön Koşullar:** Araç sistemde tanımlı olmalı. Parça değişimi gerçekleşmiş olmalı.  
**Son Koşullar:** Değişen parça bilgisi, tarih, maliyet ve ödeme tipi (kasko/ücretli) ile kayıt altına alınır.  
**Ana Senaryo:**  
Dış kaynak personeli, ilgili aracı seçerek değişen parçayı, ödeme türünü ve tarih bilgisini sisteme girer.  
**Alternatif Akış:**  
2.a Ödeme türü seçilmeden kayıt yapılmak istenirse sistem işlem yapmaz.

---

## 📄 KULLANIM SENARYOSU 7 — Yakıt Harcama Bilgisi Girişi

**Birincil Aktör:** Dış Kaynak Firması Personeli veya Sürücü  
**İlgililer ve Beklentileri:**  
- Firma: Yakıt maliyetlerini analiz etmek ister.  
- Dış kaynak: Doğru ve zamanında veri girişinden sorumludur.  
**Ön Koşullar:** Araç sistemde tanımlı olmalı. Yakıt alımı gerçekleşmiş olmalı.  
**Son Koşullar:** Yakıt alım tarihi, miktarı, tutarı gibi bilgilerle kayıt tamamlanır.  
**Ana Senaryo:**  
Yakıt alımı sonrası sürücü ya da dış kaynak personeli, aracın plakasını seçip yakıt verilerini sisteme girer.  
**Alternatif Akış:**  
2.a Aynı gün için birden fazla kayıt girilmişse sistem kullanıcıyı bilgilendirir ve onay ister.

---

## 📄 KULLANIM SENARYOSU 8 — Kullanım Türü Güncelleme (Kiralanmış / Özmal)

**Birincil Aktör:** Sistem Yöneticisi  
**İlgililer ve Beklentileri:**  
- Firma: Araçların statüsünü güncel tutmak ister.  
- Sistem yöneticisi: Veri doğruluğunun sağlanmasından sorumludur.  
**Ön Koşullar:** Araç sistemde tanımlı olmalı. Güncelleme gerekçesi belirlenmiş olmalı.  
**Son Koşullar:** Araç statüsü başarıyla "kiralık" ya da "özmal" olarak güncellenmiş olur.  
**Ana Senaryo:**  
Araç ile ilgili sahiplik durumunda değişiklik varsa sistem yöneticisi aracı seçerek statüsünü değiştirir. Güncelleme tarihi ve açıklama bilgileri de sisteme girilir.  
**Alternatif Akış:**  
2.a Statü geçersiz veya eksikse sistem uyarı verir, işlem tamamlanmaz.
---

## 📄 KULLANIM SENARYOSU 9 — Araç Harcamaları Raporlama (Bakım, Kasko, Yakıt, Tamir, Genel)

**Birincil Aktör:** Firma Yetkilisi veya Dış Kaynak Firması Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Araçlara yapılan harcamaları detaylı şekilde görmek ve analiz etmek ister.  
- Dış kaynak: Harcama kalemlerinin toplam etkisini takip etmek ister.  
**Ön Koşullar:** Araçlara ait bakım, kasko, yakıt ve tamir verileri sisteme eksiksiz girilmiş olmalı.  
**Son Koşullar:** Seçilen tarih aralığında ve kategoriye göre toplam harcama miktarları tablo ve grafik olarak görüntülenir.  
**Ana Senaryo:**  
Kullanıcı, sistemde tarih aralığını ve istenen harcama türünü seçerek raporu oluşturur. Rapor grafik ve tablo halinde görüntülenir, istenirse dışa aktarılır.  
**Alternatif Akış:**  
2.a Seçilen aralıkta hiç harcama kaydı yoksa sistem “veri bulunamadıˮ uyarısı verir.

---

## 📄 KULLANIM SENARYOSU 10 — Aylık ve Yıllık Kilometre Raporlama

**Birincil Aktör:** Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Araçların kullanım yoğunluğunu periyotlara göre analiz etmek ister.  
**Ön Koşullar:** Araçların her ayın başında kilometre verileri sisteme girilmiş olmalı.  
**Son Koşullar:** Seçilen araç(lar) için aylık veya yıllık kilometre artışları tablo ve grafik ile gösterilir.  
**Ana Senaryo:**  
Firma yetkilisi, sistemde bir araç ya da araç grubu seçerek aylık veya yıllık toplam kilometre kullanımını görüntüler.  
**Alternatif Akış:**  
2.a Araç için henüz kilometre verisi girilmemişse sistem kullanıcıyı bilgilendirir.

---

## 📄 KULLANIM SENARYOSU 11 — Sürücü Bazlı Kullanım ve Kilometre Raporlama

**Birincil Aktör:** Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Hangi çalışanın hangi araçla ne kadar yol yaptığını izlemek ister.  
**Ön Koşullar:** Sürücülere araç ataması yapılmış ve kullanım verisi sisteme girilmiş olmalı.  
**Son Koşullar:** Belirli sürücüler için kullanım süresi, kilometre miktarı ve araç detayları listelenir.  
**Ana Senaryo:**  
Firma yetkilisi bir çalışanı seçerek hangi tarihlerde hangi araçla kaç kilometre yaptığını rapor halinde alır. Veriler tablo ve grafiklerle desteklenir.  
**Alternatif Akış:**  
2.a Seçilen sürücü için sistemde kayıtlı kullanım verisi yoksa rapor boş döner ve bilgilendirme yapılır.

---

## 📄 KULLANIM SENARYOSU 12 — Havuz Araçlarının Kullanım Raporu

**Birincil Aktör:** Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Havuzdaki araçların ne sıklıkla, kimler tarafından ve hangi görevlerde kullanıldığını görmek ister.  
**Ön Koşullar:** Araç havuzda tanımlı olmalı ve kullanım görevleri sisteme işlenmiş olmalı.  
**Son Koşullar:** Seçilen tarih aralığında havuz araçlarının görev sıklığı ve kullanıcı bilgileri raporlanır.  
**Ana Senaryo:**  
Firma yetkilisi, sistemden “havuz aracıˮ filtrelemesi yaparak belirli bir periyotta hangi araçların ne kadar süre ve kimler tarafından kullanıldığını grafik ve tablo halinde alır.  
**Alternatif Akış:**  
2.a Seçilen tarihlerde hiçbir görev ataması yapılmamışsa sistem boş rapor uyarısı verir.

---

## 📄 KULLANIM SENARYOSU 13 — Araç Türüne Göre Harcama Dağılımı Raporu (Kiralanmış / Özmal)

**Birincil Aktör:** Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Kiralık ve özmal araçların maliyet farklarını analiz etmek ister.  
**Ön Koşullar:** Tüm araçlar sistemde doğru şekilde kiralık/özmal olarak etiketlenmiş ve harcama kayıtları girilmiş olmalı.  
**Son Koşullar:** Seçilen döneme ait kiralık ve özmal araçların harcama karşılaştırması tablo ve grafikle sunulur.  
**Ana Senaryo:**  
Firma yetkilisi, sistemde tarih aralığı belirleyerek araç türüne göre toplam bakım, yakıt, tamir vb. giderleri karşılaştırmalı olarak inceler.  
**Alternatif Akış:**  
2.a Araç türü bilgisi eksik olan veriler sisteme dahil edilmez, kullanıcıya uyarı gösterilir.

---

## 📄 KULLANIM SENARYOSU 14 — Harcama Tahminleme (Hareketli Ortalama Yöntemi ile)

**Birincil Aktör:** Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Gelecek dönem harcamalarını tahmin ederek bütçe planlaması yapmak ister.  
**Ön Koşullar:** En az 3 aylık geçmiş harcama verisi sisteme girilmiş olmalı.  
**Son Koşullar:** Sistem, girilen verilere göre gelecek dönem harcamasını tahmin ederek kullanıcıya sunar.  
**Ana Senaryo:**  
Firma yetkilisi, sistemde belirli araç grubunun son 3–5 aylık harcamalarını seçerek, Hareketli Ortalama Yöntemi ile bir sonraki ayın tahmini harcamasını oluşturur.  
**Alternatif Akış:**  
2.a Yeterli veri yoksa sistem tahminleme işlemini başlatmaz, kullanıcıya veri yetersizliği bildirisi verir.

---

## 📄 KULLANIM SENARYOSU 15 — Geçmiş Yıl Karşılaştırmalı Harcama Analizi

**Birincil Aktör:** Firma Yetkilisi  
**İlgililer ve Beklentileri:**  
- Firma: Aynı dönemlerdeki geçmiş yıllık harcama performansını görmek ister.  
**Ön Koşullar:** En az iki yıl boyunca aynı kategorideki harcama verileri sisteme girilmiş olmalı.  
**Son Koşullar:** Harcama kalemleri geçmiş yıllar bazında kıyaslanır ve sonuçlar görsel raporla sunulur.  
**Ana Senaryo:**  
Firma yetkilisi, sistemde aynı ay veya çeyrek dönem için geçmiş yıllara ait harcamaları karşılaştırır. Böylece artış/azalış eğilimleri analiz edilir.  
**Alternatif Akış:**  
2.a İlgili yıl için kayıt bulunmazsa sistem kullanıcıyı bilgilendirir ve rapor üretmez.