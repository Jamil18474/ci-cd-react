/**
 * MongoDB initialization script for admin user
 * Creates default administrator account if it doesn't exist
 */
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE );

db.createCollection('users');

const adminEmail = process.env.ADMIN_EMAIL;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

if (!adminEmail || !adminPasswordHash) {
    print('❌ ADMIN_EMAIL and ADMIN_PASSWORD_HASH required');
    quit(1);
}

const existingAdmin = db.users.findOne({ email: adminEmail });

if (!existingAdmin) {
    const result = db.users.insertOne({
        firstName: 'Marie',
        lastName: 'Dubois',
        email: adminEmail,
        password: adminPasswordHash,
        birthDate: new Date('1990-01-01'), // Date générique - sera cachée aux users
        city: 'Lyon',
        postalCode: '69001',
        role: 'admin',
        permissions: ['read', 'delete'],
        createdAt: new Date(),
        updatedAt: new Date()
    });

    if (result.acknowledged) {
        print('✅ Admin user created');
    }
}