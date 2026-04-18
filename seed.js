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

const skills = [
    { skillName: "Housekeeping" },
    { skillName: "Front Office Management" },
    { skillName: "Food and Beverage Service" },
    { skillName: "Bartending" },
    { skillName: "Guest Handling" },

    { skillName: "Site Supervision" },
    { skillName: "AutoCAD" },
    { skillName: "Concrete Work" },
    { skillName: "Masonry" },
    { skillName: "Steel Fixing" },

    { skillName: "Electrical Wiring" },
    { skillName: "Circuit Troubleshooting" },
    { skillName: "PLC Programming" },
    { skillName: "Industrial Automation" },
    { skillName: "Control Panel Wiring" },

    { skillName: "Pipe Installation" },
    { skillName: "Leak Detection" },
    { skillName: "Drainage Systems" },
    { skillName: "Sanitary Fittings" },
    { skillName: "Water Supply Systems" },

    { skillName: "AC Installation" },
    { skillName: "HVAC Maintenance" },
    { skillName: "Refrigeration Systems" },
    { skillName: "Duct Installation" },
    { skillName: "Ventilation Systems" },

    { skillName: "CCTV Monitoring" },
    { skillName: "Fire Safety Management" },
    { skillName: "Access Control Systems" },
    { skillName: "Surveillance" },
    { skillName: "Emergency Response" },

    { skillName: "Heavy Vehicle Driving" },
    { skillName: "Light Vehicle Driving" },
    { skillName: "Route Planning" },
    { skillName: "Logistics Coordination" },
    { skillName: "GPS Navigation" },

    { skillName: "Industrial Cleaning" },
    { skillName: "Floor Maintenance" },
    { skillName: "Waste Management" },
    { skillName: "Sanitization Procedures" },
    { skillName: "Facility Maintenance" },

    { skillName: "Patient Care" },
    { skillName: "First Aid" },
    { skillName: "Vital Signs Monitoring" },
    { skillName: "Nursing Assistance" },
    { skillName: "CPR" },

    { skillName: "JavaScript" },
    { skillName: "React" },
    { skillName: "Node.js" },
    { skillName: "Database Management" },
    { skillName: "API Development" },

    { skillName: "Data Entry" },
    { skillName: "MS Excel" },
    { skillName: "Office Management" },
    { skillName: "Email Communication" },
    { skillName: "Record Keeping" },

    { skillName: "Customer Service" },
    { skillName: "Sales Negotiation" },
    { skillName: "Inventory Management" },
    { skillName: "Product Demonstration" },
    { skillName: "Cash Handling" },

    { skillName: "Machine Operation" },
    { skillName: "Quality Control" },
    { skillName: "Assembly Line Work" },
    { skillName: "CNC Operation" },
    { skillName: "Production Planning" },

    { skillName: "Crop Cultivation" },
    { skillName: "Irrigation Systems" },
    { skillName: "Pest Control" },
    { skillName: "Harvesting Techniques" },
    { skillName: "Farm Equipment Handling" },

    { skillName: "General Labor" },
    { skillName: "Helper" },
    { skillName: "Time Management" }
];


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

async function seedSkills() {
    console.log('Seeding Skills...');
    if (prisma.skill) {
        const result = await prisma.skill.createMany({
            data: skills.map(skill => ({
                skillName: skill.skillName.toLowerCase(),
            })),
            skipDuplicates: true,
        });
        console.log(`✅ Seeded ${result.count} Skills.`);
    } else {
        console.error('❌ Error: prisma.skill is undefined.');
    }
}


async function runSeed() {
    try {
        // await seedJobCategories();
        // await seedApplicantTypes();
        // await seedAdmin();
        await seedSkills();
        console.log('🚀 Seeding completed successfully!');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runSeed();