import 'dotenv/config';
import { prisma } from '../lib/db.js';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

const USER_ROLE_ID = 'seed_role_user';

async function seedDemoData() {
  console.log('🌱 Seeding demo data for NC Mulia...\n');

  // ── 1. Create demo users ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password', 12);
  
  const demoUsers = [
    { name: 'Andi Pratama', email: 'andi@gmail.com', phone: '081234567890', membershipStatus: 'MEMBER' as const },
    { name: 'Siti Rahayu', email: 'siti@gmail.com', phone: '081234567891', membershipStatus: 'REGULAR' as const },
    { name: 'Budi Santoso', email: 'budi@gmail.com', phone: '081234567892', membershipStatus: 'MEMBER' as const },
    { name: 'Dewi Lestari', email: 'dewi@gmail.com', phone: '081234567893', membershipStatus: 'REGULAR' as const },
    { name: 'Rizki Fajar', email: 'rizki@gmail.com', phone: '081234567894', membershipStatus: 'MEMBER' as const },
  ];

  const userIds: string[] = [];
  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      userIds.push(existing.id);
      console.log(`  User "${u.name}" already exists, skipping.`);
      continue;
    }
    const created = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash,
        membershipStatus: u.membershipStatus,
        membershipExpiresAt: u.membershipStatus === 'MEMBER' ? new Date('2027-12-31') : null,
        isActive: true,
        userRoles: { create: { roleId: USER_ROLE_ID } },
      },
    });
    userIds.push(created.id);
    console.log(`  ✅ User: ${u.name} (${u.email})`);
  }

  // Also include ALL existing users so every account has demo history
  const allUsers = await prisma.user.findMany();
  for (const u of allUsers) {
    if (!userIds.includes(u.id)) userIds.push(u.id);
  }

  // Get some products for transactions
  const products = await prisma.product.findMany({ where: { isActive: true }, take: 10 });
  if (products.length === 0) {
    console.log('  ⚠️ No products found, skipping transaction seed.');
    return;
  }

  // ── 2. Seed BMI Records ────────────────────────────────────────────────
  console.log('\n📊 Seeding BMI records...');
  const bmiData = [
    { userId: userIds[0], weight: 75.5, height: 170, bmi: 26.12, category: 'KELebihan_BERAT' as const, recs: 'Kurangi makanan berlemak, tingkatkan aktivitas fisik. Konsumsi Herbalife Shake untuk kontrol berat badan.' },
    { userId: userIds[1], weight: 55.0, height: 160, bmi: 21.48, category: 'NORMAL' as const, recs: 'Berat badan ideal! Pertahankan pola makan sehat dan olahraga rutin.' },
    { userId: userIds[2], weight: 95.0, height: 175, bmi: 31.02, category: 'OBESITAS' as const, recs: 'Segera konsultasi dengan ahli nutrisi. Program penurunan berat badan intensif disarankan.' },
    { userId: userIds[3], weight: 48.0, height: 165, bmi: 17.63, category: 'KURUS' as const, recs: 'Perlu meningkatkan asupan kalori. Herbalife Protein Shake dapat membantu menambah berat badan.' },
    { userId: userIds[4], weight: 68.0, height: 172, bmi: 22.99, category: 'NORMAL' as const, recs: 'Berat badan ideal. Lanjutkan gaya hidup sehat Anda!' },
    { userId: userIds[0], weight: 73.0, height: 170, bmi: 25.26, category: 'KELebihan_BERAT' as const, recs: 'Ada penurunan berat badan 2.5kg. Bagus! Terus pertahankan program diet Anda.' },
    { userId: userIds[1], weight: 56.5, height: 160, bmi: 22.07, category: 'NORMAL' as const, recs: 'Tetap dalam rentang normal. Pertahankan pola makan seimbang.' },
    { userId: userIds[2], weight: 90.0, height: 175, bmi: 29.39, category: 'KELebihan_BERAT' as const, recs: 'Penurunan 5kg dari pengukuran sebelumnya. Progres yang sangat baik!' },
  ];

  for (const b of bmiData) {
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    await prisma.bmiRecord.create({
      data: {
        userId: b.userId,
        weight: new Prisma.Decimal(b.weight),
        height: new Prisma.Decimal(b.height),
        bmi: new Prisma.Decimal(b.bmi),
        bmiCategory: b.category,
        recommendations: b.recs,
        createdAt: new Date(Date.now() - daysAgo * 86400000),
      },
    });
    console.log(`  ✅ BMI: ${b.bmi} (${b.category})`);
  }

  // ── 3. Seed Consultations ──────────────────────────────────────────────
  console.log('\n💬 Seeding consultations...');
  const consultations = [
    { userId: userIds[0], question: 'Saya ingin menurunkan berat badan 10kg dalam 3 bulan, produk Herbalife apa yang cocok?', response: 'Untuk target penurunan 10kg dalam 3 bulan, saya sarankan program Formula 1 Shake (sarapan & makan malam), ditambah Herbal Tea Concentrate untuk meningkatkan metabolisme. Kombinasikan dengan olahraga kardio 3x seminggu.', status: 'ANSWERED' as const },
    { userId: userIds[1], question: 'Apakah Herbalife aman untuk ibu menyusui?', response: 'Herbalife Formula 1 aman untuk ibu menyusui karena mengandung nutrisi lengkap. Namun, sebaiknya konsultasikan dulu dengan dokter kandungan Anda untuk penyesuaian dosis.', status: 'ANSWERED' as const },
    { userId: userIds[2], question: 'Bagaimana cara mengonsumsi Herbalife Shake yang benar untuk program diet?', response: 'Campurkan 2 sendok takar Formula 1 dengan 250ml susu rendah lemak. Minum sebagai pengganti sarapan dan makan malam. Untuk makan siang, konsumsi makanan seimbang dengan porsi sedang.', status: 'ANSWERED' as const },
    { userId: userIds[3], question: 'Saya mau menambah berat badan, apakah Herbalife bisa membantu?', response: 'Tentu! Gunakan Herbalife Shake sebagai snack tambahan (bukan pengganti makan). Tambahkan Protein Drink Mix untuk asupan protein ekstra. Konsumsi 5-6 kali makan kecil sehari.', status: 'ANSWERED' as const },
    { userId: userIds[4], question: 'Berapa lama hasil Herbalife bisa terlihat?', response: null, status: 'PENDING' as const },
    { userId: userIds[0], question: 'Apakah Herbalife Tea bisa diminum setiap hari?', response: null, status: 'PENDING' as const },
    { userId: userIds[1], question: 'Saya alergi laktosa, apakah ada alternatif susu untuk shake?', response: 'Anda bisa menggunakan susu kedelai atau susu almond sebagai pengganti. Hasilnya tetap optimal dan aman untuk yang intoleran laktosa.', status: 'ANSWERED' as const },
    { userId: userIds[3], question: 'Produk apa yang bagus untuk kesehatan kulit?', response: null, status: 'PENDING' as const },
  ];

  for (const c of consultations) {
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    await prisma.consultation.create({
      data: {
        userId: c.userId,
        question: c.question,
        response: c.response,
        status: c.status,
        createdAt: new Date(Date.now() - daysAgo * 86400000),
      },
    });
    console.log(`  ✅ Consultation: ${c.status} - "${c.question.substring(0, 50)}..."`);
  }

  // ── 4. Seed Transactions + Payments ────────────────────────────────────
  console.log('\n🛒 Seeding transactions & payments...');
  const txStatuses: Array<{ status: 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'; payStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' }> = [
    { status: 'COMPLETED', payStatus: 'COMPLETED' },
    { status: 'COMPLETED', payStatus: 'COMPLETED' },
    { status: 'COMPLETED', payStatus: 'COMPLETED' },
    { status: 'PAID', payStatus: 'COMPLETED' },
    { status: 'PAID', payStatus: 'COMPLETED' },
    { status: 'PROCESSING', payStatus: 'COMPLETED' },
    { status: 'AWAITING_PAYMENT', payStatus: 'PENDING' },
    { status: 'AWAITING_PAYMENT', payStatus: 'PENDING' },
    { status: 'PENDING' },
    { status: 'PENDING' },
    { status: 'CANCELLED', payStatus: 'FAILED' },
    { status: 'CANCELLED' },
    { status: 'COMPLETED', payStatus: 'COMPLETED' },
    { status: 'PROCESSING', payStatus: 'COMPLETED' },
    { status: 'COMPLETED', payStatus: 'COMPLETED' },
  ];

  const payMethods: Array<'qris' | 'bca' | 'bri' | 'bni' | 'mandiri' | 'gopay' | 'ovo' | 'dana' | 'shopeepay'> = ['qris', 'bca', 'bri', 'bni', 'mandiri', 'gopay', 'ovo', 'dana', 'shopeepay'];

  for (let i = 0; i < txStatuses.length; i++) {
    const txConfig = txStatuses[i];
    const userId = userIds[i % userIds.length];
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMember = user?.membershipStatus === 'MEMBER';
    const discountRate = isMember ? 0.30 : 0;

    // Pick 1-3 random products
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = products.sort(() => Math.random() - 0.5).slice(0, numItems);

    const items = selectedProducts.map(p => {
      const qty = Math.floor(Math.random() * 3) + 1;
      const basePrice = Number(p.price);
      const discountPct = isMember && p.isMemberDiscountEligible ? discountRate * 100 : 0;
      const discountAmt = Math.round(basePrice * discountPct / 100);
      const finalPrice = basePrice - discountAmt;
      return {
        productId: p.id,
        productName: p.name,
        quantity: qty,
        basePrice: new Prisma.Decimal(basePrice),
        discountPercentage: new Prisma.Decimal(discountPct),
        discountAmount: new Prisma.Decimal(discountAmt),
        finalUnitPrice: new Prisma.Decimal(finalPrice),
        subtotal: new Prisma.Decimal(finalPrice * qty),
      };
    });

    const normalTotal = items.reduce((s, i) => s + Number(i.basePrice) * i.quantity, 0);
    const totalDiscount = items.reduce((s, i) => s + Number(i.discountAmount) * i.quantity, 0);
    const finalTotal = items.reduce((s, i) => s + Number(i.subtotal), 0);

    const daysAgo = Math.floor(Math.random() * 45) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    const tx = await prisma.transaction.create({
      data: {
        userId,
        membershipStatusSnapshot: isMember ? 'MEMBER' : 'REGULAR',
        normalTotal: new Prisma.Decimal(normalTotal),
        totalDiscount: new Prisma.Decimal(totalDiscount),
        finalTotal: new Prisma.Decimal(finalTotal),
        status: txConfig.status,
        createdAt,
        items: { create: items },
      },
    });

    // Create payment if applicable
    if (txConfig.payStatus) {
      const method = payMethods[Math.floor(Math.random() * payMethods.length)];
      const providers: Record<string, string> = { qris: 'QRIS', bca: 'BCA Virtual Account', bri: 'BRI Virtual Account', bni: 'BNI Virtual Account', mandiri: 'Mandiri Virtual Account', gopay: 'GoPay', ovo: 'OVO', dana: 'DANA', shopeepay: 'ShopeePay' };
      await prisma.payment.create({
        data: {
          transactionId: tx.id,
          userId,
          method,
          provider: providers[method] || method.toUpperCase(),
          amount: new Prisma.Decimal(finalTotal),
          referenceNumber: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          paymentCode: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          status: txConfig.payStatus,
          paidAt: txConfig.payStatus === 'COMPLETED' ? new Date(createdAt.getTime() + 3600000) : null,
          expiresAt: new Date(createdAt.getTime() + 86400000),
          createdAt,
        },
      });
    }

    console.log(`  ✅ TX #${i + 1}: ${txConfig.status} - Rp ${finalTotal.toLocaleString('id-ID')} (${items.length} items)`);
  }

  // ── 5. Seed Chat Conversations ─────────────────────────────────────────
  console.log('\n💬 Seeding chat conversations...');
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@nc-mulia.com' } });
  const adminId = adminUser?.id ?? userIds[0];

  // Get user names for customerName field
  const userNameMap: Record<string, string> = {};
  for (const uid of userIds) {
    const u = await prisma.user.findUnique({ where: { id: uid }, select: { name: true } });
    if (u) userNameMap[uid] = u.name;
  }

  const chatData = [
    {
      userId: userIds[0],
      customerName: userNameMap[userIds[0]] || 'Andi Pratama',
      category: 'SERVICE' as const,
      status: 'OPEN' as const,
      messages: [
        { senderRole: 'USER' as const, senderId: userIds[0], message: 'Halo, saya mau tanya pesanan saya sudah dikirim belum ya?' },
        { senderRole: 'ADMIN' as const, senderId: adminId, message: 'Selamat siang! Pesanan Anda sedang dalam proses pengemasan. Estimasi pengiriman 1-2 hari kerja.' },
        { senderRole: 'USER' as const, senderId: userIds[0], message: 'Terima kasih infonya!' },
      ],
    },
    {
      userId: userIds[1],
      customerName: userNameMap[userIds[1]] || 'Siti Rahayu',
      category: 'COMPLAINT' as const,
      status: 'IN_PROGRESS' as const,
      messages: [
        { senderRole: 'USER' as const, senderId: userIds[1], message: 'Saya sudah transfer tapi status masih pending, mohon dicek.' },
        { senderRole: 'ADMIN' as const, senderId: adminId, message: 'Baik, kami akan cek pembayaran Anda. Mohon kirimkan bukti transfer ya.' },
      ],
    },
    {
      userId: userIds[2],
      customerName: userNameMap[userIds[2]] || 'Budi Santoso',
      category: 'SERVICE' as const,
      status: 'CLOSED' as const,
      messages: [
        { senderRole: 'USER' as const, senderId: userIds[2], message: 'Kapan produk Herbalife terbaru masuk?' },
        { senderRole: 'ADMIN' as const, senderId: adminId, message: 'Produk terbaru sudah tersedia di katalog kami. Silakan cek halaman produk untuk melihat koleksi lengkap!' },
        { senderRole: 'USER' as const, senderId: userIds[2], message: 'Oke, terima kasih banyak!' },
        { senderRole: 'ADMIN' as const, senderId: adminId, message: 'Sama-sama! Jangan ragu untuk bertanya lagi ya 😊' },
      ],
    },
  ];

  for (const chat of chatData) {
    const daysAgo = Math.floor(Math.random() * 20) + 1;
    const conv = await prisma.chatConversation.create({
      data: {
        userId: chat.userId,
        customerName: chat.customerName,
        category: chat.category,
        status: chat.status,
        createdAt: new Date(Date.now() - daysAgo * 86400000),
      },
    });

    for (let i = 0; i < chat.messages.length; i++) {
      const msg = chat.messages[i];
      await prisma.chatMessage.create({
        data: {
          conversationId: conv.id,
          senderId: msg.senderId,
          senderRole: msg.senderRole,
          message: msg.message,
          createdAt: new Date(Date.now() - daysAgo * 86400000 + i * 300000),
        },
      });
    }
    console.log(`  ✅ Chat: "${chat.customerName}" (${chat.messages.length} messages, ${chat.status})`);
  }

  // ── 6. Seed Audit Logs ─────────────────────────────────────────────────
  console.log('\n📋 Seeding audit logs...');
  const auditEntries = [
    { action: 'CREATE', module: 'products', entityType: 'product', metadata: { detail: 'Menambahkan produk Herbalife Formula 1 Shake' } },
    { action: 'UPDATE', module: 'products', entityType: 'product', metadata: { detail: 'Memperbarui harga Herbalife Tea Concentrate' } },
    { action: 'UPDATE', module: 'transactions', entityType: 'transaction', metadata: { previousStatus: 'PENDING', newStatus: 'COMPLETED' } },
    { action: 'UPDATE', module: 'transactions', entityType: 'transaction', metadata: { previousStatus: 'AWAITING_PAYMENT', newStatus: 'PAID' } },
    { action: 'UPDATE', module: 'users', entityType: 'user', metadata: { detail: 'Mengaktifkan membership user Andi Pratama' } },
    { action: 'CREATE', module: 'locations', entityType: 'location', metadata: { detail: 'Menambahkan cabang NC Mulia Jakarta Selatan' } },
    { action: 'UPDATE', module: 'consultations', entityType: 'consultation', metadata: { detail: 'Membalas konsultasi nutrisi pengguna' } },
    { action: 'DELETE', module: 'products', entityType: 'product', metadata: { detail: 'Menonaktifkan produk yang sudah tidak tersedia' } },
    { action: 'UPDATE', module: 'settings', entityType: 'discount', metadata: { detail: 'Mengubah rate diskon member dari 25% ke 30%' } },
    { action: 'LOGIN', module: 'auth', entityType: 'session', metadata: { detail: 'Admin login dari IP 192.168.1.1' } },
    { action: 'UPDATE', module: 'users', entityType: 'user', metadata: { detail: 'Mengubah role user Budi menjadi Member' } },
    { action: 'CREATE', module: 'products', entityType: 'product', metadata: { detail: 'Menambahkan 5 produk Herbalife baru' } },
  ];

  for (const entry of auditEntries) {
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: adminId,
        action: entry.action,
        module: entry.module,
        entityType: entry.entityType,
        entityId: `seed-${crypto.randomUUID().substring(0, 8)}`,
        metadata: JSON.stringify(entry.metadata),
        createdAt: new Date(Date.now() - daysAgo * 86400000),
      },
    });
    console.log(`  ✅ Audit: [${entry.action}] ${entry.module} - ${(entry.metadata as any).detail || JSON.stringify(entry.metadata)}`);
  }

  console.log('\n🎉 Demo data seeding completed successfully!');
  console.log(`   Users: ${userIds.length}`);
  console.log(`   BMI Records: ${bmiData.length}`);
  console.log(`   Consultations: ${consultations.length}`);
  console.log(`   Transactions: ${txStatuses.length}`);
  console.log(`   Chat Conversations: ${chatData.length}`);
  console.log(`   Audit Logs: ${auditEntries.length}`);
}

seedDemoData()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
