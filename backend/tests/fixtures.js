import User from '../src/models/User.js';
import Category from '../src/models/Category.js';

export async function createAdminIfNotExists() {
    const passwordHash = await User.hashPassword('Admin1234');
    await User.findOneAndUpdate(
        { email: 'admin@asturias-familia.es' },
        { $setOnInsert: { passwordHash, role: 'admin', active: true } },
        { upsert: true, new: true }
    );
}

export async function loginAsAdmin(request, app) {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@asturias-familia.es', password: 'Admin1234' });
    return res.body.accessToken;
}

export async function createTestCategory() {
    return await Category.findOneAndUpdate(
        { slug: 'test-fixture-cat' },
        {
            $setOnInsert: {
                name: 'Test Fixture Cat',
                slug: 'test-fixture-cat',
                icon: 'test.svg',
                color: '#FF0000',
                order: 99,
                active: true
            }
        },
        { upsert: true, new: true }
    );
}

export async function cleanupTestData() {
    await User.deleteMany({ email: /test-jest|visitor-jest|visitor-cat/ });
    await Category.deleteMany({ slug: /test-jest/ });
}