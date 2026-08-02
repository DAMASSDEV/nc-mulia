# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> User authentication >> login modal closes after successful login
- Location: tests\auth.spec.ts:132:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - link "NC MULIA NUTRISI & KESEHATAN" [ref=e6] [cursor=pointer]:
        - /url: /
        - generic [ref=e10]:
          - generic [ref=e11]: NC MULIA
          - generic [ref=e12]: NUTRISI & KESEHATAN
      - navigation [ref=e13]:
        - link "Beranda" [ref=e14] [cursor=pointer]:
          - /url: /
        - link "Konsultasi" [ref=e15] [cursor=pointer]:
          - /url: /konsultasi
        - link "Hitung BMI" [ref=e16] [cursor=pointer]:
          - /url: /bmi
        - link "Produk" [ref=e17] [cursor=pointer]:
          - /url: /produk-herbalife
        - link "Riwayat Saya" [ref=e18] [cursor=pointer]:
          - /url: /riwayat
        - link "Lokasi" [ref=e19] [cursor=pointer]:
          - /url: /lokasi
      - generic [ref=e20]:
        - link "Keranjang" [ref=e21] [cursor=pointer]:
          - /url: /keranjang
        - button "Masuk" [ref=e26]
  - generic [ref=e27]:
    - generic [ref=e31]:
      - generic [ref=e32]: NC MULIA - Konsultasi Nutrisi & Kesehatan
      - heading "Solusi Nutrisi Cerdas untuk Hidup Lebih Sehat" [level=1] [ref=e35]
      - paragraph [ref=e36]: Hitung BMI, konsultasi masalah nutrisi, dan temukan produk Herbalife terbaik untuk kebutuhan tubuh Anda semua dalam satu platform.
      - generic [ref=e37]:
        - link [ref=e38] [cursor=pointer]:
          - /url: /bmi
          - button "Hitung BMI Sekarang" [ref=e39]
        - link [ref=e42] [cursor=pointer]:
          - /url: /konsultasi
          - button "Mulai Konsultasi" [ref=e43]
    - generic [ref=e51]:
      - generic [ref=e58]:
        - generic [ref=e59]: 50+
        - generic [ref=e60]: Produk Herbalife
      - generic [ref=e66]:
        - generic [ref=e67]: 100%
        - generic [ref=e68]: Produk Original
      - generic [ref=e76]:
        - generic [ref=e77]: Ribuan
        - generic [ref=e78]: Pelanggan Puas
      - generic [ref=e83]:
        - generic [ref=e84]: "2014"
        - generic [ref=e85]: Beroperasi Sejak
    - generic [ref=e87]:
      - generic [ref=e88]:
        - generic [ref=e89]: FITUR
        - heading "Semua yang Anda butuhkan untuk hidup sehat" [level=2] [ref=e90]
        - paragraph [ref=e91]: Fitur lengkap untuk mendukung perjalanan nutrisi dan kesehatan Anda, dari perhitungan BMI hingga konsultasi langsung.
      - generic [ref=e92]:
        - generic [ref=e94]:
          - heading "Konsultasi Nutrisi" [level=3] [ref=e98]
          - paragraph [ref=e99]: Ajukan pertanyaan tentang nutrisi dan diet. Tim kami siap membantu memberikan saran yang tepat untuk kebutuhan Anda.
        - generic [ref=e101]:
          - heading "Hitung BMI" [level=3] [ref=e105]
          - paragraph [ref=e106]: Ketahui kategori berat badan Anda secara instan. Didukung rekomendasi produk Herbalife yang sesuai.
        - generic [ref=e108]:
          - heading "Produk Herbalife" [level=3] [ref=e114]
          - paragraph [ref=e115]: Jelajahi berbagai produk Herbalife lengkap dengan informasi harga dan manfaat untuk mendukung gaya hidup sehat.
        - generic [ref=e117]:
          - heading "Riwayat Pribadi" [level=3] [ref=e123]
          - paragraph [ref=e124]: Pantau riwayat perhitungan BMI dan konsultasi Anda kapan saja. Semua data tersimpan dengan aman.
    - generic [ref=e127]:
      - generic [ref=e128]:
        - generic [ref=e129]:
          - generic [ref=e130]: MENGAPA KAMI
          - heading "Kenapa memilih NC MULIA?" [level=2] [ref=e131]
          - paragraph [ref=e132]: Kami hadir untuk memberikan layanan konsultasi nutrisi yang terpercaya dan berbasis kebutuhan Anda.
        - list [ref=e133]:
          - listitem [ref=e134]: Konsultasi dari tim yang berpengalaman di bidang nutrisi
          - listitem [ref=e138]: Perhitungan BMI yang akurat dan terpercaya
          - listitem [ref=e142]: Rekomendasi produk sesuai kebutuhan tubuh Anda
          - listitem [ref=e146]: Data riwayat yang tersimpan dan mudah diakses
          - listitem [ref=e150]: Informasi lengkap tentang setiap produk Herbalife
        - link [ref=e155] [cursor=pointer]:
          - /url: /konsultasi
          - button "Konsultasi Sekarang" [ref=e156]
      - generic [ref=e160]:
        - generic [ref=e165]:
          - generic [ref=e166]: NC MULIA
          - generic [ref=e167]: Klinik Nutrisi & Kesehatan
        - generic [ref=e168]:
          - generic [ref=e169]:
            - generic [ref=e170]: Konsultasi
            - generic [ref=e171]: Tersedia setiap hari
          - generic [ref=e172]:
            - generic [ref=e173]: Produk
            - generic [ref=e174]: 50+ item original
          - generic [ref=e175]:
            - generic [ref=e176]: BMI Kalkulator
            - generic [ref=e177]: Akurat & mudah
    - generic [ref=e181]:
      - heading "Siap memulai perjalanan sehat Anda?" [level=2] [ref=e182]
      - paragraph [ref=e183]: Hitung BMI Anda sekarang dan temukan langkah pertama menuju gaya hidup yang lebih sehat.
      - generic [ref=e184]:
        - link [ref=e185] [cursor=pointer]:
          - /url: /bmi
          - button "Hitung BMI Sekarang" [ref=e186]
        - link [ref=e187] [cursor=pointer]:
          - /url: /produk-herbalife
          - button "Lihat Produk" [ref=e188]
    - generic [ref=e191]:
      - generic [ref=e196]:
        - heading "Kunjungi Klinik Kami" [level=3] [ref=e197]
        - paragraph [ref=e198]: Temukan lokasi klinik NC MULIA terdekat dari Anda
      - link [ref=e199] [cursor=pointer]:
        - /url: /lokasi
        - button "Lihat Lokasi" [ref=e200]
  - contentinfo [ref=e203]:
    - generic [ref=e204]:
      - generic [ref=e205]:
        - generic [ref=e206]:
          - generic [ref=e211]:
            - generic [ref=e212]: NC MULIA
            - generic [ref=e213]: NUTRISI & KESEHATAN
          - paragraph [ref=e214]: Konsultasi nutrisi profesional dan produk Herbalife untuk gaya hidup sehat Anda.
        - generic [ref=e215]:
          - heading "Ikuti Kami" [level=3] [ref=e216]
          - generic [ref=e217]:
            - link "Instagram NC MULIA" [ref=e218] [cursor=pointer]:
              - /url: https://instagram.com/ncmulia
            - link "Facebook NC MULIA" [ref=e221] [cursor=pointer]:
              - /url: https://facebook.com/ncmulia
            - link "WhatsApp NC MULIA" [ref=e224] [cursor=pointer]:
              - /url: https://wa.me/6285157279448
            - link "TikTok NC MULIA" [ref=e227] [cursor=pointer]:
              - /url: https://tiktok.com/@ncmulia
        - generic [ref=e230]:
          - heading "Kontak" [level=3] [ref=e231]
          - list [ref=e232]:
            - listitem [ref=e233]:
              - generic [ref=e237]: Jl. Sudirman No. 88, Jakarta Pusat, DKI Jakarta
            - listitem [ref=e238]:
              - link "0851-5727-9448" [ref=e241] [cursor=pointer]:
                - /url: https://wa.me/6285157279448
            - listitem [ref=e242]:
              - generic [ref=e246]: info@nc.mulia
      - paragraph [ref=e248]: © 2026 NC MULIA. Hak cipta dilindungi.
  - generic [ref=e251]:
    - generic [ref=e256]:
      - heading "Masuk" [level=2] [ref=e257]
      - paragraph [ref=e258]: Selamat datang kembali
    - generic [ref=e259]: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
    - generic [ref=e260]:
      - generic [ref=e261]:
        - generic [ref=e262]: Email
        - textbox "Email" [ref=e264]:
          - /placeholder: nama@email.com
          - text: admin@nc-mulia.com
      - generic [ref=e265]:
        - generic [ref=e266]:
          - generic [ref=e267]: Password
          - textbox "Password" [ref=e269]:
            - /placeholder: Masukkan password
            - text: password
        - button [ref=e270]
      - button "Masuk" [ref=e274]
    - button "Belum punya akun? Daftar di sini" [ref=e275]
```

# Test source

```ts
  39  | 
  40  |     // Verify modal title
  41  |     await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
  42  | 
  43  |     // Verify email and password inputs are present
  44  |     await expect(page.getByLabel('Email')).toBeVisible();
  45  |     await expect(page.getByLabel('Password')).toBeVisible();
  46  | 
  47  |     // Submit button should say "Masuk"
  48  |     await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  49  |   });
  50  | 
  51  |   test('guest can switch to registration form', async ({ page }) => {
  52  |     await page.goto('/');
  53  |     await openLoginModal(page);
  54  | 
  55  |     // Click the register link inside the modal
  56  |     await page.getByText('Daftar di sini').click();
  57  | 
  58  |     // Registration form should appear
  59  |     await expect(page.getByRole('heading', { name: 'Daftar Akun' })).toBeVisible();
  60  |     await expect(page.getByLabel('Nama Lengkap')).toBeVisible();
  61  |     await expect(page.getByLabel('Email')).toBeVisible();
  62  |     await expect(page.getByLabel('Password')).toBeVisible();
  63  |     await expect(page.getByRole('button', { name: 'Daftar' })).toBeVisible();
  64  |   });
  65  | 
  66  |   test('invalid credentials show error message', async ({ page }) => {
  67  |     await page.goto('/');
  68  |     await openLoginModal(page);
  69  | 
  70  |     // Fill in wrong credentials
  71  |     await page.getByLabel('Email').fill('wrong@email.com');
  72  |     await page.getByLabel('Password').fill('wrongpassword');
  73  |     await page.getByRole('button', { name: 'Masuk' }).last().click();
  74  | 
  75  |     // Error message should appear
  76  |     await expect(
  77  |       page.locator('[class*="bg-danger-soft"]').or(page.locator('[class*="text-danger"]'))
  78  |     ).toBeVisible({ timeout: 8_000 });
  79  |   });
  80  | 
  81  |   test('guest can register a new account with unique email', async ({ page }) => {
  82  |     await page.goto('/');
  83  |     await openLoginModal(page);
  84  | 
  85  |     // Switch to register form
  86  |     await page.getByText('Daftar di sini').click();
  87  | 
  88  |     // Fill registration form
  89  |     const email = uniqueEmail();
  90  |     await page.getByLabel('Nama Lengkap').fill('E2E Test User');
  91  |     await page.getByLabel('Email').fill(email);
  92  |     await page.getByLabel('Password').fill('TestPassword123!');
  93  |     await page.getByRole('button', { name: 'Daftar' }).click();
  94  | 
  95  |     // After successful registration, the login modal should open
  96  |     // with the email pre-filled
  97  |     await page.waitForTimeout(1_000);
  98  | 
  99  |     // The registration form should close and login form opens
  100 |     // The email field in the login form should be pre-filled
  101 |     const loginEmail = page.getByLabel('Email');
  102 |     await expect(loginEmail).toBeVisible({ timeout: 5_000 });
  103 |     const emailValue = await loginEmail.inputValue();
  104 |     expect(emailValue).toBe(email);
  105 |   });
  106 | });
  107 | 
  108 | /* ─── Login Tests ─────────────────────────────────────────── */
  109 | 
  110 | test.describe('User authentication', () => {
  111 | 
  112 |   test('user can login with valid admin credentials', async ({ page }) => {
  113 |     await page.goto('/');
  114 |     await openLoginModal(page);
  115 | 
  116 |     await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
  117 | 
  118 |     // After login, the username should appear in the navbar
  119 |     await expect(page.getByText(TEST_CREDENTIALS.admin.email)).toBeVisible({ timeout: 10_000 });
  120 |   });
  121 | 
  122 |   test('user can login with valid member credentials', async ({ page }) => {
  123 |     await page.goto('/');
  124 |     await openLoginModal(page);
  125 | 
  126 |     await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  127 | 
  128 |     // After login, the user name should appear in the navbar
  129 |     await expect(page.getByText(TEST_CREDENTIALS.user.email)).toBeVisible({ timeout: 10_000 });
  130 |   });
  131 | 
  132 |   test('login modal closes after successful login', async ({ page }) => {
  133 |     await page.goto('/');
  134 |     await openLoginModal(page);
  135 | 
  136 |     await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
  137 | 
  138 |     // The modal (dialog) should no longer be present in the DOM
> 139 |     await page.waitForFunction(
      |                ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
  140 |       () => !document.querySelector('[class*="fixed inset-0 z-[70]"]'),
  141 |       { timeout: 10_000 }
  142 |     );
  143 |   });
  144 | 
  145 |   test('after login, username appears in navbar', async ({ page }) => {
  146 |     await page.goto('/');
  147 |     await openLoginModal(page);
  148 | 
  149 |     await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  150 | 
  151 |     // User info block should be visible in navbar
  152 |     // The user name "Syam" should be visible
  153 |     const userNameElement = page.locator('[class*="font-medium text-foreground"]').first();
  154 |     await expect(userNameElement).toBeVisible({ timeout: 10_000 });
  155 |   });
  156 | 
  157 |   test('admin link appears in navbar after admin login', async ({ page }) => {
  158 |     await page.goto('/');
  159 |     await openLoginModal(page);
  160 | 
  161 |     await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
  162 | 
  163 |     // Admin button should appear in navbar
  164 |     const adminLink = page.getByText('Admin');
  165 |     await expect(adminLink).toBeVisible({ timeout: 10_000 });
  166 |   });
  167 | });
  168 | 
  169 | /* ─── Logout Tests ────────────────────────────────────────── */
  170 | 
  171 | test.describe('User logout', () => {
  172 | 
  173 |   test('user can logout', async ({ page }) => {
  174 |     // Login first
  175 |     await page.goto('/');
  176 |     await openLoginModal(page);
  177 |     await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  178 |     await page.waitForTimeout(1_000);
  179 | 
  180 |     // Now logout
  181 |     await logout(page);
  182 | 
  183 |     // The "Masuk" button should be visible again
  184 |     await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  185 |   });
  186 | 
  187 |   test('admin can logout', async ({ page }) => {
  188 |     // Login as admin
  189 |     await page.goto('/');
  190 |     await openLoginModal(page);
  191 |     await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
  192 |     await page.waitForTimeout(1_000);
  193 | 
  194 |     // Logout
  195 |     await logout(page);
  196 | 
  197 |     // The "Masuk" button should be visible again
  198 |     await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  199 |   });
  200 | 
  201 |   test('after logout, user cannot access protected routes', async ({ page }) => {
  202 |     // Login then logout
  203 |     await page.goto('/');
  204 |     await openLoginModal(page);
  205 |     await login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
  206 |     await page.waitForTimeout(1_000);
  207 |     await logout(page);
  208 | 
  209 |     // Try to access a protected route
  210 |     await page.goto('/dashboard');
  211 |     await page.waitForTimeout(1_000);
  212 | 
  213 |     // Should redirect to home page (since user is not authenticated)
  214 |     // The page should either show "Masuk" button or redirect to home
  215 |     await expect(page.getByRole('button', { name: 'Masuk' }).or(page.getByRole('heading').filter({ hasText: /solusi/i }))).toBeVisible({ timeout: 5_000 });
  216 |   });
  217 | });
  218 | 
```