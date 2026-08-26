import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
          from: '"Blog App" <no-reply@yourdomain.com>',
          to: user.email,
          subject: "Verify your email address",
          text: `
            Hello ${user.name || "there"},

            Welcome to Blog App!

            Please verify your email address to complete your account setup:

            ${verificationUrl}

            This verification link will expire in 15 minutes.

            If you did not create an account with Blog App, you can safely ignore this email.

            For security reasons, please do not share this link with anyone.

            Best regards,
            The Blog App Team

            © ${new Date().getFullYear()} Blog App. All rights reserved.
            `.trim(),

          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify your email address</title>
            </head>

            <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif;
            color: #18181b;
            ">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color: #f4f4f5; padding: 40px 16px;"
            >
                <tr>
                <td align="center">

                    <!-- Main Container -->
                    <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border: 1px solid #e4e4e7;
                        border-radius: 12px;
                        overflow: hidden;
                    "
                    >

                    <!-- Header -->
                    <tr>
                        <td
                        style="
                            padding: 28px 32px;
                            border-bottom: 1px solid #e4e4e7;
                        "
                        >
                        <div style="
                            font-size: 20px;
                            font-weight: 700;
                            color: #18181b;
                        ">
                            Blog App
                        </div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 32px;">

                        <h1 style="
                            margin: 0 0 16px;
                            font-size: 24px;
                            line-height: 32px;
                            font-weight: 700;
                            color: #18181b;
                        ">
                            Verify your email address
                        </h1>

                        <p style="
                            margin: 0 0 16px;
                            font-size: 15px;
                            line-height: 24px;
                            color: #52525b;
                        ">
                            Hello ${user.name || "there"},
                        </p>

                        <p style="
                            margin: 0 0 24px;
                            font-size: 15px;
                            line-height: 24px;
                            color: #52525b;
                        ">
                            Welcome to Blog App. Please verify your email address
                            to complete your account setup and get started.
                        </p>

                        <!-- CTA -->
                        <table
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="margin: 0 0 28px;"
                        >
                            <tr>
                            <td
                                align="center"
                                style="
                                border-radius: 8px;
                                background-color: #18181b;
                                "
                            >
                                <a
                                href="${verificationUrl}"
                                target="_blank"
                                style="
                                    display: inline-block;
                                    padding: 13px 22px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    line-height: 20px;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 8px;
                                "
                                >
                                Verify Email Address
                                </a>
                            </td>
                            </tr>
                        </table>

                        <!-- Expiration -->
                        <div style="
                            margin: 0 0 24px;
                            padding: 14px 16px;
                            background-color: #fafafa;
                            border: 1px solid #e4e4e7;
                            border-radius: 8px;
                        ">
                            <p style="
                            margin: 0;
                            font-size: 13px;
                            line-height: 20px;
                            color: #52525b;
                            ">
                            <strong style="color: #18181b;">
                                This link expires in 15 minutes.
                            </strong>
                            Please request a new verification email if the link
                            expires.
                            </p>
                        </div>

                        <!-- Fallback URL -->
                        <p style="
                            margin: 0 0 8px;
                            font-size: 13px;
                            line-height: 20px;
                            color: #71717a;
                        ">
                            If the button above doesn't work, copy and paste this
                            URL into your browser:
                        </p>

                        <p style="
                            margin: 0 0 28px;
                            font-size: 12px;
                            line-height: 20px;
                            word-break: break-all;
                        ">
                            <a
                            href="${verificationUrl}"
                            target="_blank"
                            style="
                                color: #0031d1;
                                text-decoration: underline;
                            "
                            >
                            ${verificationUrl}
                            </a>
                        </p>

                        <!-- Security Notice -->
                        <p style="
                            margin: 0;
                            padding-top: 24px;
                            border-top: 1px solid #e4e4e7;
                            font-size: 13px;
                            line-height: 20px;
                            color: #71717a;
                        ">
                            If you did not create an account with Blog App,
                            you can safely ignore this email. For your security,
                            please do not share this verification link with anyone.
                        </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                        style="
                            padding: 24px 32px;
                            background-color: #fafafa;
                            border-top: 1px solid #e4e4e7;
                        "
                        >

                        <p style="
                            margin: 0 0 8px;
                            font-size: 12px;
                            line-height: 18px;
                            color: #71717a;
                        ">
                            This is an automated email. Please do not reply to this
                            message.
                        </p>

                        <p style="
                            margin: 0;
                            font-size: 12px;
                            line-height: 18px;
                            color: #a1a1aa;
                        ">
                            © ${new Date().getFullYear()} Blog App.
                            All rights reserved.
                        </p>

                        </td>
                    </tr>

                    </table>

                </td>
                </tr>
            </table>

            </body>
            </html>
  `.trim(),
        });

        console.log("Message sent: %s", info.messageId);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
