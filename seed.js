const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
process.loadEnvFile('.env');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});


const prisma = new PrismaClient({ adapter });

const jobCategories = [
    { categoryName: 'Hospitality & Hotel' },
    { categoryName: 'Construction & Civil' },
    { categoryName: 'Electrical & Electronics' },
    { categoryName: 'Plumbing & Pipe Fitting' },
    { categoryName: 'HVAC & Air Conditioning' },
    { categoryName: 'Security & Safety' },
    { categoryName: 'Driving & Transport' },
    { categoryName: 'Cleaning & Facility' },
    { categoryName: 'Healthcare & Nursing' },
    { categoryName: 'IT & Technology' },
    { categoryName: 'Admin & Office' },
    { categoryName: 'Retail & Sales' },
    { categoryName: 'Manufacturing & Production' },
    { categoryName: 'Agriculture & Farming' },
    { categoryName: 'Other' },
];

async function seedJobCategories() {
    console.log('Seeding job categories...');
    if (prisma.jobCategory) {
        const result = await prisma.jobCategory.createMany({
            data: jobCategories,
            skipDuplicates: true,
        });
        console.log(`✅ Seeded ${result.count} job categories.`);
    } else {
        console.error('❌ Error: prisma.jobCategory is undefined.');
    }
}

const applicantTypes = [
    { applicantTypeName: 'Fresh Graduate / Entry Level' },
    { applicantTypeName: 'Nepal-Based Experienced' },
    { applicantTypeName: 'GCC-Returned' },
    { applicantTypeName: 'Currently Working in GCC (Transferable)' },
    { applicantTypeName: 'Skilled & Certified Professional' },
    { applicantTypeName: 'Semi-Skilled (Blue Collar)' },
    { applicantTypeName: 'White Collar (Admin/Office)' },
    { applicantTypeName: 'Overseas Ready (Passport/Police Clearance)' },
    { applicantTypeName: 'Skilled Nepali Training Completed' },
    { applicantTypeName: 'Short-Term / Part-Time' },
]


async function seedApplicantTypes() {
    console.log('Seeding Applicant Type...');
    if (prisma.applicantType) {
        const result = await prisma.applicantType.createMany({
            data: applicantTypes,
            skipDuplicates: true,
        });
        console.log(`✅ Seeded ${result.count} Applicant Type.`);
    } else {
        console.error('❌ Error: prisma.applicantType is undefined.');
    }
}

async function seedAdmin() {
    console.log('Seeding Admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminData = {
        email: 'admin@skillednepali.com',
        fullName: 'System Administrator',
        password: hashedPassword,
        country: 1,
        role: 'ADMIN',
    };

    try {
        const admin = await prisma.user.upsert({
            where: { email: adminData.email },
            update: {},
            create: adminData,
        });
        console.log(`✅ Admin user ${admin.email} is ready.`);
    } catch (error) {
        console.error('❌ Error seeding Admin:', error);
    }
}

async function runSeed() {
    try {
        // await seedJobCategories();
        // await seedApplicantTypes();
        await seedAdmin();
        console.log('🚀 Seeding completed successfully!');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runSeed();