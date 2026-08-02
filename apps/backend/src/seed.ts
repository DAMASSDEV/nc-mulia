import 'dotenv/config';
import { prisma } from './lib/db.js';
import bcrypt from 'bcryptjs';

// ── Seed IDs (deterministic for consistent seeding) ───────────────────────────
const SUPER_ADMIN_ROLE_ID = 'seed_role_super_admin';
const ADMIN_ROLE_ID = 'seed_role_admin';
const USER_ROLE_ID = 'seed_role_user';

// ── Permission definitions ────────────────────────────────────────────────────
const PERMISSIONS = [
  // Dashboard
  { key: 'dashboard:read', module: 'dashboard', action: 'read', description: 'View dashboard overview' },
  // Products
  { key: 'products:read', module: 'products', action: 'read', description: 'View products' },
  { key: 'products:create', module: 'products', action: 'create', description: 'Create products' },
  { key: 'products:update', module: 'products', action: 'update', description: 'Update products' },
  { key: 'products:delete', module: 'products', action: 'delete', description: 'Delete products' },
  // Users
  { key: 'users:read', module: 'users', action: 'read', description: 'View users' },
  { key: 'users:create', module: 'users', action: 'create', description: 'Create users' },
  { key: 'users:update', module: 'users', action: 'update', description: 'Update users' },
  { key: 'users:activate', module: 'users', action: 'activate', description: 'Activate/deactivate users' },
  { key: 'users:assign_role', module: 'users', action: 'assign_role', description: 'Assign roles to users' },
  { key: 'users:manage_membership', module: 'users', action: 'manage_membership', description: 'Manage user memberships' },
  // Transactions
  { key: 'transactions:read', module: 'transactions', action: 'read', description: 'View transactions' },
  { key: 'transactions:update', module: 'transactions', action: 'update', description: 'Update transaction status' },
  { key: 'transactions:export', module: 'transactions', action: 'export', description: 'Export transactions' },
  // Payments
  { key: 'payments:read', module: 'payments', action: 'read', description: 'View payments' },
  { key: 'payments:verify', module: 'payments', action: 'verify', description: 'Verify payments' },
  { key: 'payments:update', module: 'payments', action: 'update', description: 'Update payment status' },
  { key: 'payments:export', module: 'payments', action: 'export', description: 'Export payments' },
  // Consultations
  { key: 'consultations:read', module: 'consultations', action: 'read', description: 'View consultations' },
  { key: 'consultations:respond', module: 'consultations', action: 'respond', description: 'Respond to consultations' },
  { key: 'consultations:close', module: 'consultations', action: 'close', description: 'Close consultations' },
  // BMI
  { key: 'bmi:read', module: 'bmi', action: 'read', description: 'View BMI records' },
  { key: 'bmi:delete', module: 'bmi', action: 'delete', description: 'Delete BMI records' },
  { key: 'bmi:export', module: 'bmi', action: 'export', description: 'Export BMI records' },
  // Chat
  { key: 'chat:read', module: 'chat', action: 'read', description: 'View chat conversations' },
  { key: 'chat:reply', module: 'chat', action: 'reply', description: 'Reply to chats' },
  { key: 'chat:assign', module: 'chat', action: 'assign', description: 'Assign chat conversations' },
  { key: 'chat:close', module: 'chat', action: 'close', description: 'Close chat conversations' },
  // Locations
  { key: 'locations:read', module: 'locations', action: 'read', description: 'View locations' },
  { key: 'locations:create', module: 'locations', action: 'create', description: 'Create locations' },
  { key: 'locations:update', module: 'locations', action: 'update', description: 'Update locations' },
  { key: 'locations:delete', module: 'locations', action: 'delete', description: 'Delete locations' },
  // Roles
  { key: 'roles:read', module: 'roles', action: 'read', description: 'View roles' },
  { key: 'roles:create', module: 'roles', action: 'create', description: 'Create custom roles' },
  { key: 'roles:update', module: 'roles', action: 'update', description: 'Update roles' },
  { key: 'roles:delete', module: 'roles', action: 'delete', description: 'Delete custom roles' },
  { key: 'roles:manage_permissions', module: 'roles', action: 'manage_permissions', description: 'Manage role permissions' },
  // Audit
  { key: 'audit:read', module: 'audit', action: 'read', description: 'View audit logs' },
  // Settings
  { key: 'settings:read', module: 'settings', action: 'read', description: 'View settings' },
  { key: 'settings:update', module: 'settings', action: 'update', description: 'Update settings' },
  // Menus
  { key: 'menus:read', module: 'menus', action: 'read', description: 'View navigation menu' },
  { key: 'menus:update', module: 'menus', action: 'update', description: 'Update navigation menu' },
];

// ── Role definitions ─────────────────────────────────────────────────────────
const ROLES = [
  {
    id: SUPER_ADMIN_ROLE_ID,
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Full system access, cannot be modified',
    isSystem: true,
    isActive: true,
  },
  {
    id: ADMIN_ROLE_ID,
    name: 'Admin',
    slug: 'admin',
    description: 'Administrative access',
    isSystem: true,
    isActive: true,
  },
  {
    id: USER_ROLE_ID,
    name: 'User',
    slug: 'user',
    description: 'Regular user access',
    isSystem: true,
    isActive: true,
  },
];

// ── Navigation item definitions ──────────────────────────────────────────────
const NAVIGATION_ITEMS = [
  // Admin sidebar
  { key: 'admin_overview', label: 'Dashboard', route: '/admin', iconKey: 'LayoutDashboard', section: 'admin', sortOrder: 0, isSystem: true, audience: 'ADMIN' as const },
  { key: 'admin_users', label: 'Pengguna', route: '/admin/users', iconKey: 'Users', section: 'admin', sortOrder: 10, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'users:read' },
  { key: 'admin_products', label: 'Produk', route: '/admin/products', iconKey: 'Package', section: 'admin', sortOrder: 20, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'products:read' },
  { key: 'admin_transactions', label: 'Transaksi', route: '/admin/transactions', iconKey: 'Receipt', section: 'admin', sortOrder: 30, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'transactions:read' },
  { key: 'admin_payments', label: 'Pembayaran', route: '/admin/payments', iconKey: 'CreditCard', section: 'admin', sortOrder: 40, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'payments:read' },
  { key: 'admin_consultations', label: 'Konsultasi', route: '/admin/consultations', iconKey: 'MessageSquare', section: 'admin', sortOrder: 50, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'consultations:read' },
  { key: 'admin_bmi', label: 'BMI Records', route: '/admin/bmi-records', iconKey: 'Activity', section: 'admin', sortOrder: 60, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'bmi:read' },
  { key: 'admin_chat', label: 'Live Chat', route: '/admin/chat', iconKey: 'MessageCircle', section: 'admin', sortOrder: 70, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'chat:read' },
  { key: 'admin_locations', label: 'Lokasi', route: '/admin/locations', iconKey: 'MapPin', section: 'admin', sortOrder: 80, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'locations:read' },
  { key: 'admin_roles', label: 'Role & Akses', route: '/admin/roles', iconKey: 'Shield', section: 'admin', sortOrder: 85, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'roles:read' },
  { key: 'admin_audit', label: 'Audit Log', route: '/admin/audit', iconKey: 'FileText', section: 'admin', sortOrder: 90, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'audit:read' },
  { key: 'admin_settings', label: 'Pengaturan', route: '/admin/settings', iconKey: 'Settings', section: 'admin', sortOrder: 95, isSystem: true, audience: 'ADMIN' as const, requiredPermission: 'settings:read' },
];

async function seed() {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD must be set');
    process.exit(1);
  }

  console.log('Starting RBAC seed...\n');

  // 1. Upsert system roles
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description, isSystem: role.isSystem, isActive: role.isActive },
      create: role,
    });
    console.log(`  Role: ${role.name} (${role.slug})`);
  }

  // 2. Upsert permissions
  const permIds: Record<string, string> = {};
  for (const perm of PERMISSIONS) {
    const existing = await prisma.permission.findUnique({ where: { key: perm.key } });
    const id = existing?.id ?? crypto.randomUUID();
    if (!existing) {
      await prisma.permission.create({ data: { id, ...perm } });
    }
    permIds[perm.key] = id;
    console.log(`  Permission: ${perm.key}`);
  }

  // 3. Assign all permissions to SUPER_ADMIN
  const superAdminPerms = PERMISSIONS.map(p => ({ roleId: SUPER_ADMIN_ROLE_ID, permissionId: permIds[p.key] }));
  await prisma.rolePermission.deleteMany({ where: { roleId: SUPER_ADMIN_ROLE_ID } });
  await prisma.rolePermission.createMany({ data: superAdminPerms });
  console.log(`  Assigned ${PERMISSIONS.length} permissions to Super Admin`);

  // 4. Assign specific permissions to ADMIN (no roles:delete, no audit:read of others, no settings:update)
  const adminPerms = PERMISSIONS
    .filter(p => p.key !== 'roles:delete')
    .map(p => ({ roleId: ADMIN_ROLE_ID, permissionId: permIds[p.key] }));
  await prisma.rolePermission.deleteMany({ where: { roleId: ADMIN_ROLE_ID } });
  await prisma.rolePermission.createMany({ data: adminPerms });
  console.log(`  Assigned ${adminPerms.length} permissions to Admin`);

  // 5. Assign basic permissions to USER
  const userPerms = PERMISSIONS
    .filter(p => ['products:read', 'locations:read'].includes(p.key))
    .map(p => ({ roleId: USER_ROLE_ID, permissionId: permIds[p.key] }));
  await prisma.rolePermission.deleteMany({ where: { roleId: USER_ROLE_ID } });
  await prisma.rolePermission.createMany({ data: userPerms });
  console.log(`  Assigned ${userPerms.length} permissions to User`);

  // 6. Seed navigation items
  for (const nav of NAVIGATION_ITEMS) {
    await prisma.navigationItem.upsert({
      where: { key: nav.key },
      update: { label: nav.label, route: nav.route, iconKey: nav.iconKey, section: nav.section, sortOrder: nav.sortOrder, isSystem: nav.isSystem, requiredPermission: nav.requiredPermission, audience: nav.audience },
      create: nav,
    });
  }
  console.log(`  Seeded ${NAVIGATION_ITEMS.length} navigation items`);

  // 7. Assign all nav items to SUPER_ADMIN
  const allNavs = await prisma.navigationItem.findMany();
  await prisma.roleNavigationItem.deleteMany({ where: { roleId: SUPER_ADMIN_ROLE_ID } });
  await prisma.roleNavigationItem.createMany({
    data: allNavs.map(n => ({ roleId: SUPER_ADMIN_ROLE_ID, navigationItemId: n.id })),
  });
  console.log(`  Assigned ${allNavs.length} nav items to Super Admin`);

  // 8. Assign nav items to ADMIN (based on their actual permissions)
  // Admin has all permissions except roles:delete
  const adminNavs = await prisma.navigationItem.findMany({
    where: {
      OR: [
        { requiredPermission: null },
        { requiredPermission: { not: 'roles:delete' } },
      ],
    },
  });
  await prisma.roleNavigationItem.deleteMany({ where: { roleId: ADMIN_ROLE_ID } });
  await prisma.roleNavigationItem.createMany({
    data: adminNavs.map(n => ({ roleId: ADMIN_ROLE_ID, navigationItemId: n.id })),
  });
  console.log(`  Assigned ${adminNavs.length} nav items to Admin`);

  // 9. Seed default discounts
  const defaultDiscounts = [
    { key: 'member', label: 'Member Discount', rate: 0.30, isSystem: true },
  ];
  for (const d of defaultDiscounts) {
    await prisma.discount.upsert({
      where: { key: d.key },
      update: { rate: d.rate, isActive: true },
      create: { id: crypto.randomUUID(), ...d },
    });
    console.log(`  Discount: ${d.label} = ${d.rate * 100}%`);
  }

  // 9. Create or update admin user
  const passwordHash = await bcrypt.hash(password, 12);
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    // Migrate existing admin to SUPER_ADMIN role
    await prisma.userRole.deleteMany({ where: { userId: existingUser.id } });
    await prisma.userRole.create({ data: { userId: existingUser.id, roleId: SUPER_ADMIN_ROLE_ID } });
    console.log(`  Admin "${email}" updated with SUPER_ADMIN role`);
  } else {
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        membershipStatus: 'REGULAR',
        isActive: true,
        userRoles: { create: { roleId: SUPER_ADMIN_ROLE_ID } },
      },
    });
    console.log(`  Admin "${email}" created with SUPER_ADMIN role`);
  }

  // 10. Create or update demo member user
  const userName = process.env.SEED_USER_NAME;
  const userEmail = process.env.SEED_USER_EMAIL;
  const userPassword = process.env.SEED_USER_PASSWORD;
  if (userName && userEmail && userPassword) {
    const userPasswordHash = await bcrypt.hash(userPassword, 12);
    const existingUserMember = await prisma.user.findUnique({ where: { email: userEmail.toLowerCase() } });
    if (existingUserMember) {
      await prisma.userRole.deleteMany({ where: { userId: existingUserMember.id } });
      await prisma.userRole.create({ data: { userId: existingUserMember.id, roleId: USER_ROLE_ID } });
      console.log(`  User "${userEmail}" updated with USER role`);
    } else {
      await prisma.user.create({
        data: {
          name: userName.trim(),
          email: userEmail.toLowerCase(),
          passwordHash: userPasswordHash,
          membershipStatus: 'REGULAR',
          isActive: true,
          userRoles: { create: { roleId: USER_ROLE_ID } },
        },
      });
      console.log(`  User "${userEmail}" created with USER role`);
    }
  }

  console.log('\nRBAC seed completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
