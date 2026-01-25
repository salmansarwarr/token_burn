import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.warn(
            "⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set in environment variables",
        );
        console.warn("⚠️  Skipping admin user creation");
        return;
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUsers.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log("✅ Admin user already exists:", adminEmail);
        return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await prisma.adminUsers.create({
        data: {
            email: adminEmail,
            passwordHash,
        },
    });

    console.log("✅ Created admin user:", admin.email);
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
