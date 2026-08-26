import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth.middleware";

async function seedAdmin() {
  try {
    const adminData = {
      name: "Mr. Admin",
      email: "admin@example.com",
      role: UserRole.ADMIN,
      password: "admin1234",
    };
    // check user exist on db or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exist in db!");
    }

    const signUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Better Auth validates signup requests against `trustedOrigins`.
          Origin: process.env.APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      },
    );

    
    const response = await signUpAdmin.json();

    if (!signUpAdmin.ok) {
      throw new Error(
        `Failed to seed admin (${signUpAdmin.status}): ${JSON.stringify(response)}`,
      );
    }

    await prisma.user.update({
      where: { email: adminData.email },
      data: { emailVerified: true },
    });

    console.log("Admin user seeded successfully.");
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
