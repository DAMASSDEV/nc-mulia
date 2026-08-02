# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-member.spec.ts >> Member product browsing >> member can add product to cart
- Location: tests\user-member.spec.ts:81:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e5]:
      - link "NC MULIA NUTRISI & KESEHATAN" [ref=f1e6] [cursor=pointer]:
        - /url: /
        - generic [ref=f1e10]:
          - generic [ref=f1e11]: NC MULIA
          - generic [ref=f1e12]: NUTRISI & KESEHATAN
      - navigation [ref=f1e13]:
        - link "Beranda" [ref=f1e14] [cursor=pointer]:
          - /url: /
        - link "Konsultasi" [ref=f1e15] [cursor=pointer]:
          - /url: /konsultasi
        - link "Hitung BMI" [ref=f1e16] [cursor=pointer]:
          - /url: /bmi
        - link "Produk" [ref=f1e17] [cursor=pointer]:
          - /url: /produk-herbalife
        - link "Riwayat Saya" [ref=f1e18] [cursor=pointer]:
          - /url: /riwayat
        - link "Lokasi" [ref=f1e19] [cursor=pointer]:
          - /url: /lokasi
      - generic [ref=f1e20]:
        - link "Keranjang" [ref=f1e21] [cursor=pointer]:
          - /url: /keranjang
        - button "Masuk" [ref=f1e26]
  - generic [ref=f1e27]:
    - generic [ref=f1e28]:
      - generic [ref=f1e29]:
        - generic [ref=f1e30]: NC MULIA OFFICIAL STORE
        - heading "Herbalife Shop" [level=1] [ref=f1e31]
        - paragraph [ref=f1e32]: Informasi produk Herbalife , terus 100% Original
      - generic [ref=f1e33]: 50 Produk
    - generic [ref=f1e35]:
      - textbox "Cari produk Herbalife..." [ref=f1e36]
      - generic [ref=f1e37]:
        - button "All" [ref=f1e38]
        - button "Shake" [ref=f1e39]
        - button "Tea" [ref=f1e40]
        - button "Bar" [ref=f1e41]
        - button "Suplemen" [ref=f1e42]
        - button "Program" [ref=f1e43]
    - generic [ref=f1e44]:
      - generic [ref=f1e45]:
        - generic [ref=f1e46]:
          - img "Herbalife Formula 1 Shake Vanilla" [ref=f1e48]
          - generic [ref=f1e49]: Shake
        - generic [ref=f1e50]:
          - generic [ref=f1e51]: Herbalife Formula 1 Shake Vanilla
          - generic [ref=f1e52]: Rp 450.000
          - paragraph [ref=f1e53]: Nutrisi lengkap pengganti makan
          - button "+ Tambah ke Keranjang" [ref=f1e54]
      - generic [ref=f1e55]:
        - generic [ref=f1e56]:
          - img "Herbalife Formula 1 Shake Chocolate" [ref=f1e58]
          - generic [ref=f1e59]: Shake
        - generic [ref=f1e60]:
          - generic [ref=f1e61]: Herbalife Formula 1 Shake Chocolate
          - generic [ref=f1e62]: Rp 450.000
          - paragraph [ref=f1e63]: Rasa coklat premium
          - button "+ Tambah ke Keranjang" [ref=f1e64]
      - generic [ref=f1e65]:
        - generic [ref=f1e66]:
          - img "Herbalife Formula 1 Shake Strawberry" [ref=f1e68]
          - generic [ref=f1e69]: Shake
        - generic [ref=f1e70]:
          - generic [ref=f1e71]: Herbalife Formula 1 Shake Strawberry
          - generic [ref=f1e72]: Rp 450.000
          - paragraph [ref=f1e73]: Rasa stroberi segar
          - button "+ Tambah ke Keranjang" [ref=f1e74]
      - generic [ref=f1e75]:
        - generic [ref=f1e76]:
          - img "Herbalife Formula 1 Shake Banana" [ref=f1e78]
          - generic [ref=f1e79]: Shake
        - generic [ref=f1e80]:
          - generic [ref=f1e81]: Herbalife Formula 1 Shake Banana
          - generic [ref=f1e82]: Rp 450.000
          - paragraph [ref=f1e83]: Rasa pisang manis
          - button "+ Tambah ke Keranjang" [ref=f1e84]
      - generic [ref=f1e85]:
        - generic [ref=f1e86]:
          - img "Herbalife Formula 1 Shake Mango" [ref=f1e88]
          - generic [ref=f1e89]: Shake
        - generic [ref=f1e90]:
          - generic [ref=f1e91]: Herbalife Formula 1 Shake Mango
          - generic [ref=f1e92]: Rp 455.000
          - paragraph [ref=f1e93]: Rasa mangga tropis
          - button "+ Tambah ke Keranjang" [ref=f1e94]
      - generic [ref=f1e95]:
        - generic [ref=f1e96]:
          - img "Herbalife Formula 1 Shake Coffee" [ref=f1e98]
          - generic [ref=f1e99]: Shake
        - generic [ref=f1e100]:
          - generic [ref=f1e101]: Herbalife Formula 1 Shake Coffee
          - generic [ref=f1e102]: Rp 460.000
          - paragraph [ref=f1e103]: Rasa kopi energik
          - button "+ Tambah ke Keranjang" [ref=f1e104]
      - generic [ref=f1e105]:
        - generic [ref=f1e106]:
          - img "Herbalife Tea Mix Original" [ref=f1e108]
          - generic [ref=f1e109]: Tea
        - generic [ref=f1e110]:
          - generic [ref=f1e111]: Herbalife Tea Mix Original
          - generic [ref=f1e112]: Rp 280.000
          - paragraph [ref=f1e113]: Teh herbal untuk metabolisme
          - button "+ Tambah ke Keranjang" [ref=f1e114]
      - generic [ref=f1e115]:
        - generic [ref=f1e116]:
          - img "Herbalife Tea Mix Lemon" [ref=f1e118]
          - generic [ref=f1e119]: Tea
        - generic [ref=f1e120]:
          - generic [ref=f1e121]: Herbalife Tea Mix Lemon
          - generic [ref=f1e122]: Rp 285.000
          - paragraph [ref=f1e123]: Teh lemon untuk detox
          - button "+ Tambah ke Keranjang" [ref=f1e124]
      - generic [ref=f1e125]:
        - generic [ref=f1e126]:
          - img "Herbalife Tea Mix Peach" [ref=f1e128]
          - generic [ref=f1e129]: Tea
        - generic [ref=f1e130]:
          - generic [ref=f1e131]: Herbalife Tea Mix Peach
          - generic [ref=f1e132]: Rp 285.000
          - paragraph [ref=f1e133]: Teh persik segar
          - button "+ Tambah ke Keranjang" [ref=f1e134]
      - generic [ref=f1e135]:
        - generic [ref=f1e136]:
          - img "Herbalife Tea Mix Raspberry" [ref=f1e138]
          - generic [ref=f1e139]: Tea
        - generic [ref=f1e140]:
          - generic [ref=f1e141]: Herbalife Tea Mix Raspberry
          - generic [ref=f1e142]: Rp 290.000
          - paragraph [ref=f1e143]: Teh raspberry manis
          - button "+ Tambah ke Keranjang" [ref=f1e144]
      - generic [ref=f1e145]:
        - generic [ref=f1e146]:
          - img "Herbalife Protein Bar Chocolate" [ref=f1e148]
          - generic [ref=f1e149]: Bar
        - generic [ref=f1e150]:
          - generic [ref=f1e151]: Herbalife Protein Bar Chocolate
          - generic [ref=f1e152]: Rp 175.000
          - paragraph [ref=f1e153]: Protein bar rasa coklat
          - button "+ Tambah ke Keranjang" [ref=f1e154]
      - generic [ref=f1e155]:
        - generic [ref=f1e156]:
          - img "Herbalife Protein Bar Peanut" [ref=f1e158]
          - generic [ref=f1e159]: Bar
        - generic [ref=f1e160]:
          - generic [ref=f1e161]: Herbalife Protein Bar Peanut
          - generic [ref=f1e162]: Rp 175.000
          - paragraph [ref=f1e163]: Protein bar rasa kacang
          - button "+ Tambah ke Keranjang" [ref=f1e164]
      - generic [ref=f1e165]:
        - generic [ref=f1e166]:
          - img "Herbalife Personalized Protein Powder" [ref=f1e168]
          - generic [ref=f1e169]: Suplemen
        - generic [ref=f1e170]:
          - generic [ref=f1e171]: Herbalife Personalized Protein Powder
          - generic [ref=f1e172]: Rp 320.000
          - paragraph [ref=f1e173]: Protein tambahan
          - button "+ Tambah ke Keranjang" [ref=f1e174]
      - generic [ref=f1e175]:
        - generic [ref=f1e176]:
          - img "Herbalife Cell-U-Loss" [ref=f1e178]
          - generic [ref=f1e179]: Suplemen
        - generic [ref=f1e180]:
          - generic [ref=f1e181]: Herbalife Cell-U-Loss
          - generic [ref=f1e182]: Rp 265.000
          - paragraph [ref=f1e183]: Membantu mengurangi retensi air
          - button "+ Tambah ke Keranjang" [ref=f1e184]
      - generic [ref=f1e185]:
        - generic [ref=f1e186]:
          - img "Herbalife Herbal Concentrate" [ref=f1e188]
          - generic [ref=f1e189]: Suplemen
        - generic [ref=f1e190]:
          - generic [ref=f1e191]: Herbalife Herbal Concentrate
          - generic [ref=f1e192]: Rp 195.000
          - paragraph [ref=f1e193]: Konsentrat herbal
          - button "+ Tambah ke Keranjang" [ref=f1e194]
      - generic [ref=f1e195]:
        - generic [ref=f1e196]:
          - img "Herbalife Xtra-Cal" [ref=f1e198]
          - generic [ref=f1e199]: Suplemen
        - generic [ref=f1e200]:
          - generic [ref=f1e201]: Herbalife Xtra-Cal
          - generic [ref=f1e202]: Rp 210.000
          - paragraph [ref=f1e203]: Suplemen kalsium
          - button "+ Tambah ke Keranjang" [ref=f1e204]
      - generic [ref=f1e205]:
        - generic [ref=f1e206]:
          - img "Herbalife Multivitamin" [ref=f1e208]
          - generic [ref=f1e209]: Suplemen
        - generic [ref=f1e210]:
          - generic [ref=f1e211]: Herbalife Multivitamin
          - generic [ref=f1e212]: Rp 240.000
          - paragraph [ref=f1e213]: Multivitamin harian
          - button "+ Tambah ke Keranjang" [ref=f1e214]
      - generic [ref=f1e215]:
        - generic [ref=f1e216]:
          - img "Herbalife Active Fiber Complex" [ref=f1e218]
          - generic [ref=f1e219]: Suplemen
        - generic [ref=f1e220]:
          - generic [ref=f1e221]: Herbalife Active Fiber Complex
          - generic [ref=f1e222]: Rp 185.000
          - paragraph [ref=f1e223]: Serat untuk pencernaan
          - button "+ Tambah ke Keranjang" [ref=f1e224]
      - generic [ref=f1e225]:
        - generic [ref=f1e226]:
          - img "Herbalife Niteworks" [ref=f1e228]
          - generic [ref=f1e229]: Suplemen
        - generic [ref=f1e230]:
          - generic [ref=f1e231]: Herbalife Niteworks
          - generic [ref=f1e232]: Rp 295.000
          - paragraph [ref=f1e233]: Suplemen untuk relaksasi
          - button "+ Tambah ke Keranjang" [ref=f1e234]
      - generic [ref=f1e235]:
        - generic [ref=f1e236]:
          - img "Herbalife Prolessa Duo" [ref=f1e238]
          - generic [ref=f1e239]: Program
        - generic [ref=f1e240]:
          - generic [ref=f1e241]: Herbalife Prolessa Duo
          - generic [ref=f1e242]: Rp 385.000
          - paragraph [ref=f1e243]: Program penurunan berat badan
          - button "+ Tambah ke Keranjang" [ref=f1e244]
      - generic [ref=f1e245]:
        - generic [ref=f1e246]:
          - img "Herbalife Formula 1 Shake Cookies & Cream" [ref=f1e248]
          - generic [ref=f1e249]: Shake
        - generic [ref=f1e250]:
          - generic [ref=f1e251]: Herbalife Formula 1 Shake Cookies & Cream
          - generic [ref=f1e252]: Rp 455.000
          - paragraph [ref=f1e253]: Rasa kue krim
          - button "+ Tambah ke Keranjang" [ref=f1e254]
      - generic [ref=f1e255]:
        - generic [ref=f1e256]:
          - img "Herbalife Formula 1 Shake Orange Cream" [ref=f1e258]
          - generic [ref=f1e259]: Shake
        - generic [ref=f1e260]:
          - generic [ref=f1e261]: Herbalife Formula 1 Shake Orange Cream
          - generic [ref=f1e262]: Rp 450.000
          - paragraph [ref=f1e263]: Rasa jeruk krim
          - button "+ Tambah ke Keranjang" [ref=f1e264]
      - generic [ref=f1e265]:
        - generic [ref=f1e266]:
          - img "Herbalife Formula 1 Shake Dutch Chocolate" [ref=f1e268]
          - generic [ref=f1e269]: Shake
        - generic [ref=f1e270]:
          - generic [ref=f1e271]: Herbalife Formula 1 Shake Dutch Chocolate
          - generic [ref=f1e272]: Rp 465.000
          - paragraph [ref=f1e273]: Coklat premium Belanda
          - button "+ Tambah ke Keranjang" [ref=f1e274]
      - generic [ref=f1e275]:
        - generic [ref=f1e276]:
          - img "Herbalife Formula 1 Shake Cafe Latte" [ref=f1e278]
          - generic [ref=f1e279]: Shake
        - generic [ref=f1e280]:
          - generic [ref=f1e281]: Herbalife Formula 1 Shake Cafe Latte
          - generic [ref=f1e282]: Rp 460.000
          - paragraph [ref=f1e283]: Rasa kopi latte
          - button "+ Tambah ke Keranjang" [ref=f1e284]
      - generic [ref=f1e285]:
        - generic [ref=f1e286]:
          - img "Herbalife Formula 1 Shake Pina Colada" [ref=f1e288]
          - generic [ref=f1e289]: Shake
        - generic [ref=f1e290]:
          - generic [ref=f1e291]: Herbalife Formula 1 Shake Pina Colada
          - generic [ref=f1e292]: Rp 455.000
          - paragraph [ref=f1e293]: Rasa nanas kelapa
          - button "+ Tambah ke Keranjang" [ref=f1e294]
      - generic [ref=f1e295]:
        - generic [ref=f1e296]:
          - img "Herbalife Tea Mix Mint" [ref=f1e298]
          - generic [ref=f1e299]: Tea
        - generic [ref=f1e300]:
          - generic [ref=f1e301]: Herbalife Tea Mix Mint
          - generic [ref=f1e302]: Rp 285.000
          - paragraph [ref=f1e303]: Teh mint segar
          - button "+ Tambah ke Keranjang" [ref=f1e304]
      - generic [ref=f1e305]:
        - generic [ref=f1e306]:
          - img "Herbalife Tea Mix Hibiscus" [ref=f1e308]
          - generic [ref=f1e309]: Tea
        - generic [ref=f1e310]:
          - generic [ref=f1e311]: Herbalife Tea Mix Hibiscus
          - generic [ref=f1e312]: Rp 290.000
          - paragraph [ref=f1e313]: Teh bunga rosella
          - button "+ Tambah ke Keranjang" [ref=f1e314]
      - generic [ref=f1e315]:
        - generic [ref=f1e316]:
          - img "Herbalife Tea Mix Ginger" [ref=f1e318]
          - generic [ref=f1e319]: Tea
        - generic [ref=f1e320]:
          - generic [ref=f1e321]: Herbalife Tea Mix Ginger
          - generic [ref=f1e322]: Rp 285.000
          - paragraph [ref=f1e323]: Teh jahe hangat
          - button "+ Tambah ke Keranjang" [ref=f1e324]
      - generic [ref=f1e325]:
        - generic [ref=f1e326]:
          - img "Herbalife Protein Bar Almond" [ref=f1e328]
          - generic [ref=f1e329]: Bar
        - generic [ref=f1e330]:
          - generic [ref=f1e331]: Herbalife Protein Bar Almond
          - generic [ref=f1e332]: Rp 179.000
          - paragraph [ref=f1e333]: Protein bar rasa almond
          - button "+ Tambah ke Keranjang" [ref=f1e334]
      - generic [ref=f1e335]:
        - generic [ref=f1e336]:
          - img "Herbalife Protein Bar Coconut" [ref=f1e338]
          - generic [ref=f1e339]: Bar
        - generic [ref=f1e340]:
          - generic [ref=f1e341]: Herbalife Protein Bar Coconut
          - generic [ref=f1e342]: Rp 179.000
          - paragraph [ref=f1e343]: Protein bar rasa kelapa
          - button "+ Tambah ke Keranjang" [ref=f1e344]
      - generic [ref=f1e345]:
        - generic [ref=f1e346]:
          - img "Herbalife Personalized Protein Powder Chocolate" [ref=f1e348]
          - generic [ref=f1e349]: Suplemen
        - generic [ref=f1e350]:
          - generic [ref=f1e351]: Herbalife Personalized Protein Powder Chocolate
          - generic [ref=f1e352]: Rp 325.000
          - paragraph [ref=f1e353]: Protein rasa coklat
          - button "+ Tambah ke Keranjang" [ref=f1e354]
      - generic [ref=f1e355]:
        - generic [ref=f1e356]:
          - img "Herbalife Personalized Protein Powder Vanilla" [ref=f1e358]
          - generic [ref=f1e359]: Suplemen
        - generic [ref=f1e360]:
          - generic [ref=f1e361]: Herbalife Personalized Protein Powder Vanilla
          - generic [ref=f1e362]: Rp 325.000
          - paragraph [ref=f1e363]: Protein rasa vanilla
          - button "+ Tambah ke Keranjang" [ref=f1e364]
      - generic [ref=f1e365]:
        - generic [ref=f1e366]:
          - img "Herbalife Cell-U-Loss Advanced" [ref=f1e368]
          - generic [ref=f1e369]: Suplemen
        - generic [ref=f1e370]:
          - generic [ref=f1e371]: Herbalife Cell-U-Loss Advanced
          - generic [ref=f1e372]: Rp 275.000
          - paragraph [ref=f1e373]: Formula lanjutan
          - button "+ Tambah ke Keranjang" [ref=f1e374]
      - generic [ref=f1e375]:
        - generic [ref=f1e376]:
          - img "Herbalife Xtra-Cal Advanced" [ref=f1e378]
          - generic [ref=f1e379]: Suplemen
        - generic [ref=f1e380]:
          - generic [ref=f1e381]: Herbalife Xtra-Cal Advanced
          - generic [ref=f1e382]: Rp 225.000
          - paragraph [ref=f1e383]: Kalsium dengan vitamin D
          - button "+ Tambah ke Keranjang" [ref=f1e384]
      - generic [ref=f1e385]:
        - generic [ref=f1e386]:
          - img "Herbalife Multivitamin Plus" [ref=f1e388]
          - generic [ref=f1e389]: Suplemen
        - generic [ref=f1e390]:
          - generic [ref=f1e391]: Herbalife Multivitamin Plus
          - generic [ref=f1e392]: Rp 255.000
          - paragraph [ref=f1e393]: Multivitamin premium
          - button "+ Tambah ke Keranjang" [ref=f1e394]
      - generic [ref=f1e395]:
        - generic [ref=f1e396]:
          - img "Herbalife Active Fiber Complex Plus" [ref=f1e398]
          - generic [ref=f1e399]: Suplemen
        - generic [ref=f1e400]:
          - generic [ref=f1e401]: Herbalife Active Fiber Complex Plus
          - generic [ref=f1e402]: Rp 195.000
          - paragraph [ref=f1e403]: Serat premium
          - button "+ Tambah ke Keranjang" [ref=f1e404]
      - generic [ref=f1e405]:
        - generic [ref=f1e406]:
          - img "Herbalife Niteworks Plus" [ref=f1e408]
          - generic [ref=f1e409]: Suplemen
        - generic [ref=f1e410]:
          - generic [ref=f1e411]: Herbalife Niteworks Plus
          - generic [ref=f1e412]: Rp 315.000
          - paragraph [ref=f1e413]: Untuk relaksasi lebih baik
          - button "+ Tambah ke Keranjang" [ref=f1e414]
      - generic [ref=f1e415]:
        - generic [ref=f1e416]:
          - img "Herbalife Prolessa Duo Advanced" [ref=f1e418]
          - generic [ref=f1e419]: Program
        - generic [ref=f1e420]:
          - generic [ref=f1e421]: Herbalife Prolessa Duo Advanced
          - generic [ref=f1e422]: Rp 415.000
          - paragraph [ref=f1e423]: Program lanjutan
          - button "+ Tambah ke Keranjang" [ref=f1e424]
      - generic [ref=f1e425]:
        - generic [ref=f1e426]:
          - img "Herbalife Formula 1 Shake Tropical Fruit" [ref=f1e428]
          - generic [ref=f1e429]: Shake
        - generic [ref=f1e430]:
          - generic [ref=f1e431]: Herbalife Formula 1 Shake Tropical Fruit
          - generic [ref=f1e432]: Rp 450.000
          - paragraph [ref=f1e433]: Rasa buah tropis
          - button "+ Tambah ke Keranjang" [ref=f1e434]
      - generic [ref=f1e435]:
        - generic [ref=f1e436]:
          - img "Herbalife Formula 1 Shake Berry Bliss" [ref=f1e438]
          - generic [ref=f1e439]: Shake
        - generic [ref=f1e440]:
          - generic [ref=f1e441]: Herbalife Formula 1 Shake Berry Bliss
          - generic [ref=f1e442]: Rp 450.000
          - paragraph [ref=f1e443]: Rasa berry campur
          - button "+ Tambah ke Keranjang" [ref=f1e444]
      - generic [ref=f1e445]:
        - generic [ref=f1e446]:
          - img "Herbalife Formula 1 Shake Mocha" [ref=f1e448]
          - generic [ref=f1e449]: Shake
        - generic [ref=f1e450]:
          - generic [ref=f1e451]: Herbalife Formula 1 Shake Mocha
          - generic [ref=f1e452]: Rp 460.000
          - paragraph [ref=f1e453]: Rasa mocha spesial
          - button "+ Tambah ke Keranjang" [ref=f1e454]
      - generic [ref=f1e455]:
        - generic [ref=f1e456]:
          - img "Herbalife Tea Mix Green" [ref=f1e458]
          - generic [ref=f1e459]: Tea
        - generic [ref=f1e460]:
          - generic [ref=f1e461]: Herbalife Tea Mix Green
          - generic [ref=f1e462]: Rp 285.000
          - paragraph [ref=f1e463]: Teh hijau alami
          - button "+ Tambah ke Keranjang" [ref=f1e464]
      - generic [ref=f1e465]:
        - generic [ref=f1e466]:
          - img "Herbalife Tea Mix Cinnamon" [ref=f1e468]
          - generic [ref=f1e469]: Tea
        - generic [ref=f1e470]:
          - generic [ref=f1e471]: Herbalife Tea Mix Cinnamon
          - generic [ref=f1e472]: Rp 285.000
          - paragraph [ref=f1e473]: Teh kayu manis
          - button "+ Tambah ke Keranjang" [ref=f1e474]
      - generic [ref=f1e475]:
        - generic [ref=f1e476]:
          - img "Herbalife Protein Bar Caramel" [ref=f1e478]
          - generic [ref=f1e479]: Bar
        - generic [ref=f1e480]:
          - generic [ref=f1e481]: Herbalife Protein Bar Caramel
          - generic [ref=f1e482]: Rp 179.000
          - paragraph [ref=f1e483]: Protein bar rasa karamel
          - button "+ Tambah ke Keranjang" [ref=f1e484]
      - generic [ref=f1e485]:
        - generic [ref=f1e486]:
          - img "Herbalife Protein Bar Lemon" [ref=f1e488]
          - generic [ref=f1e489]: Bar
        - generic [ref=f1e490]:
          - generic [ref=f1e491]: Herbalife Protein Bar Lemon
          - generic [ref=f1e492]: Rp 179.000
          - paragraph [ref=f1e493]: Protein bar rasa lemon
          - button "+ Tambah ke Keranjang" [ref=f1e494]
      - generic [ref=f1e495]:
        - generic [ref=f1e496]:
          - img "Herbalife Omega-3" [ref=f1e498]
          - generic [ref=f1e499]: Suplemen
        - generic [ref=f1e500]:
          - generic [ref=f1e501]: Herbalife Omega-3
          - generic [ref=f1e502]: Rp 235.000
          - paragraph [ref=f1e503]: Suplemen Omega-3
          - button "+ Tambah ke Keranjang" [ref=f1e504]
      - generic [ref=f1e505]:
        - generic [ref=f1e506]:
          - img "Herbalife CoQ10" [ref=f1e508]
          - generic [ref=f1e509]: Suplemen
        - generic [ref=f1e510]:
          - generic [ref=f1e511]: Herbalife CoQ10
          - generic [ref=f1e512]: Rp 265.000
          - paragraph [ref=f1e513]: Suplemen jantung
          - button "+ Tambah ke Keranjang" [ref=f1e514]
      - generic [ref=f1e515]:
        - generic [ref=f1e516]:
          - img "Herbalife Calcium Plus" [ref=f1e518]
          - generic [ref=f1e519]: Suplemen
        - generic [ref=f1e520]:
          - generic [ref=f1e521]: Herbalife Calcium Plus
          - generic [ref=f1e522]: Rp 215.000
          - paragraph [ref=f1e523]: Kalsium tambahan
          - button "+ Tambah ke Keranjang" [ref=f1e524]
      - generic [ref=f1e525]:
        - generic [ref=f1e526]:
          - img "Herbalife Chromium" [ref=f1e528]
          - generic [ref=f1e529]: Suplemen
        - generic [ref=f1e530]:
          - generic [ref=f1e531]: Herbalife Chromium
          - generic [ref=f1e532]: Rp 195.000
          - paragraph [ref=f1e533]: Suplemen mineral chromium
          - button "+ Tambah ke Keranjang" [ref=f1e534]
      - generic [ref=f1e535]:
        - generic [ref=f1e536]:
          - img "Herbalife Immune Booster" [ref=f1e538]
          - generic [ref=f1e539]: Suplemen
        - generic [ref=f1e540]:
          - generic [ref=f1e541]: Herbalife Immune Booster
          - generic [ref=f1e542]: Rp 245.000
          - paragraph [ref=f1e543]: Penguat daya tahan tubuh
          - button "+ Tambah ke Keranjang" [ref=f1e544]
    - generic [ref=f1e545]: Semua produk Herbalife dijamin ORIGINAL
  - contentinfo [ref=f1e546]:
    - generic [ref=f1e547]:
      - generic [ref=f1e548]:
        - generic [ref=f1e549]:
          - generic [ref=f1e554]:
            - generic [ref=f1e555]: NC MULIA
            - generic [ref=f1e556]: NUTRISI & KESEHATAN
          - paragraph [ref=f1e557]: Konsultasi nutrisi profesional dan produk Herbalife untuk gaya hidup sehat Anda.
        - generic [ref=f1e558]:
          - heading "Ikuti Kami" [level=3] [ref=f1e559]
          - generic [ref=f1e560]:
            - link "Instagram NC MULIA" [ref=f1e561] [cursor=pointer]:
              - /url: https://instagram.com/ncmulia
            - link "Facebook NC MULIA" [ref=f1e564] [cursor=pointer]:
              - /url: https://facebook.com/ncmulia
            - link "WhatsApp NC MULIA" [ref=f1e567] [cursor=pointer]:
              - /url: https://wa.me/6285157279448
            - link "TikTok NC MULIA" [ref=f1e570] [cursor=pointer]:
              - /url: https://tiktok.com/@ncmulia
        - generic [ref=f1e573]:
          - heading "Kontak" [level=3] [ref=f1e574]
          - list [ref=f1e575]:
            - listitem [ref=f1e576]:
              - generic [ref=f1e580]: Jl. Sudirman No. 88, Jakarta Pusat, DKI Jakarta
            - listitem [ref=f1e581]:
              - link "0851-5727-9448" [ref=f1e584] [cursor=pointer]:
                - /url: https://wa.me/6285157279448
            - listitem [ref=f1e585]:
              - generic [ref=f1e589]: info@nc.mulia
      - paragraph [ref=f1e591]: © 2026 NC MULIA. Hak cipta dilindungi.
```

# Test source

```ts
  87  |  * Uses page-specific selectors to ensure the page has loaded.
  88  |  */
  89  | export async function navigateAndWait(
  90  |   page: Page,
  91  |   path: string,
  92  |   options?: { waitForSelector?: string }
  93  | ): Promise<void> {
  94  |   await page.goto(path, { waitUntil: 'networkidle' });
  95  | 
  96  |   if (options?.waitForSelector) {
  97  |     await page.waitForSelector(options.waitForSelector, { timeout: 10_000 });
  98  |   } else {
  99  |     // Default: wait for the main content area to appear
  100 |     await page.waitForLoadState('domcontentloaded');
  101 |     await page.waitForTimeout(500); // Allow React to render
  102 |   }
  103 | }
  104 | 
  105 | /**
  106 |  * Waits for the page to stabilize after navigation or interaction.
  107 |  * Useful after clicking buttons that trigger async operations.
  108 |  */
  109 | export async function waitForPageLoad(page: Page): Promise<void> {
  110 |   await page.waitForLoadState('networkidle');
  111 |   await page.waitForTimeout(300);
  112 | }
  113 | 
  114 | /* ─── Mobile Helpers ───────────────────────────────────────── */
  115 | 
  116 | /**
  117 |  * Opens the mobile menu if visible, or does nothing if already on desktop.
  118 |  */
  119 | export async function openMobileMenu(page: Page): Promise<void> {
  120 |   const menuButton = page.locator('button.md\\:hidden').first();
  121 |   if (await menuButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
  122 |     await menuButton.click();
  123 |     await page.waitForTimeout(300);
  124 |   }
  125 | }
  126 | 
  127 | /**
  128 |  * Closes the mobile menu if open.
  129 |  */
  130 | export async function closeMobileMenu(page: Page): Promise<void> {
  131 |   const closeButton = page.locator('button.md\\:hidden').first();
  132 |   if (await closeButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
  133 |     const isMenuOpen = await page.locator('text=Dashboard').first().isVisible({ timeout: 1_000 }).catch(() => false);
  134 |     if (isMenuOpen) {
  135 |       await closeButton.click();
  136 |       await page.waitForTimeout(300);
  137 |     }
  138 |   }
  139 | }
  140 | 
  141 | /* ─── UI Helpers ───────────────────────────────────────────── */
  142 | 
  143 | /**
  144 |  * Waits for a loading spinner to disappear from the page.
  145 |  */
  146 | export async function waitForLoadingToFinish(page: Page): Promise<void> {
  147 |   // Wait for any loading spinner to vanish
  148 |   const spinner = page.locator('[class*="animate-spin"]');
  149 |   await page.waitForFunction(
  150 |     () => !document.querySelector('[class*="animate-spin"]'),
  151 |     { timeout: 15_000 }
  152 |   ).catch(() => {/* ignore if already gone */});
  153 | }
  154 | 
  155 | /**
  156 |  * Generates a unique email address using a timestamp.
  157 |  * Useful for registration tests that need unique emails each run.
  158 |  */
  159 | export function uniqueEmail(): string {
  160 |   return `e2e_${Date.now()}_${Math.random().toString(36).slice(2)}@nc-mulia.com`;
  161 | }
  162 | 
  163 | /**
  164 |  * Dismisses any visible error or success toast messages.
  165 |  */
  166 | export async function dismissToasts(page: Page): Promise<void> {
  167 |   const closeButtons = page.locator('[class*="toast"] button, [class*="notice"] button, button:has-text("Tutup"), button:has-text("✕")');
  168 |   const count = await closeButtons.count();
  169 |   for (let i = 0; i < count; i++) {
  170 |     const btn = closeButtons.nth(0);
  171 |     if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
  172 |       await btn.click();
  173 |       await page.waitForTimeout(200);
  174 |     }
  175 |   }
  176 | }
  177 | 
  178 | /* ─── Cart Helpers ─────────────────────────────────────────── */
  179 | 
  180 | /**
  181 |  * Adds a product to the cart from the products page.
  182 |  * Assumes the products page is already loaded.
  183 |  */
  184 | export async function addFirstProductToCart(page: Page): Promise<void> {
  185 |   // Find the first "Tambah ke Keranjang" button
  186 |   const addButton = page.locator('button:has-text("Tambah ke Keranjang")').first();
> 187 |   await addButton.click();
      |                   ^ Error: locator.click: Target page, context or browser has been closed
  188 |   // Wait for the "Ditambahkan!" or "Sudah di Keranjang" state
  189 |   await page.waitForSelector(
  190 |     page.locator('button:has-text("Ditambahkan"), button:has-text("Sudah di Keranjang")'),
  191 |     { timeout: 5_000 }
  192 |   );
  193 | }
  194 | 
  195 | /* ─── Admin Helpers ─────────────────────────────────────────── */
  196 | 
  197 | /**
  198 |  * Navigates to an admin section from the admin overview page.
  199 |  */
  200 | export async function navigateToAdminSection(page: Page, section: string): Promise<void> {
  201 |   await page.goto(`/admin/${section}`, { waitUntil: 'networkidle' });
  202 |   await page.waitForTimeout(500);
  203 | }
  204 | 
```