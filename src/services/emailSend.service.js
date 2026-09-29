const transporter = require("../utils/mailer");

//password reset email
const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Kaamdaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Password Reset</h2>

                <p>You requested to reset your password.</p>

                <p>Your OTP is:</p>

                <h1 style="letter-spacing: 5px;">
                    ${otp}
                </h1>

                <p>This OTP will expire in 10 minutes.</p>

                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        `,
    });
};

//password reset confirmation email
const sendPasswordResetConfirmationEmail = async (email) => {
    await transporter.sendMail({
        from: `"KaamDaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Confirmation",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Password Reset Confirmation</h2>

                <p>Your password has been reset successfully.</p>

                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        `,
    });
};

//account creation confirmation mail
const sendAccountCreationConfirmationEmail = async (fullName, email, role) => {
    const appUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://kaamdaar.owlstip.com";
    const displayName = fullName ? fullName.trim() : "Valued Member";
    const currentYear = new Date().getFullYear();

    const formattedRole = role
        ? role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : "Member";

    const roleGuidance = {
        JOBSEEKER: "Explore verified job vacancies, showcase your skills, and apply directly to top employers.",
        EMPLOYER: "Post job openings, discover vetted candidates, and streamline your hiring process.",
        TRAINING_CENTRE: "Publish vocational training programs, connect with enthusiastic learners, and certify skills.",
        ADMIN: "Access the administrative portal to manage platform settings, verification requests, and users."
    }[role?.toUpperCase()] || "Log in to your account, update your profile, and start exploring opportunities tailored for you.";

    await transporter.sendMail({
        from: `"KaamDaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to KaamDaar - Your Account is Ready! 🎉",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to KaamDaar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
    <!-- Preheader preview text (hidden) -->
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Welcome to KaamDaar! Your account has been created successfully. Complete your profile to get started.
    </div>

    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); background-color: #1e3a8a; padding: 36px 32px 32px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                Kaamdaar</span>
                            </h1>
                            <p style="margin: 6px 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                                Connecting talents and opportunities
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px;">
                            <!-- Welcome Icon / Badge -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #ecfdf5; border: 2px solid #a7f3d0; text-align: center;">
                                    <span style="font-size: 26px; color: #059669;">✓</span>
                                </div>
                            </div>

                            <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.3;">
                                Welcome aboard, ${displayName}!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 15px; color: #475569; text-align: center; line-height: 1.6;">
                                Your KaamDaar account has been successfully created. We're excited to have you join our community connecting skilled talent, employers, and training institutions.
                            </p>

                            <!-- Account Details Card -->
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; padding: 18px 20px;">
                                <tr>
                                    <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Account Details
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Full Name</td>
                                    <td align="right" style="padding: 12px 0 6px; font-size: 14px; color: #0f172a; font-weight: 600;">${displayName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Email Address</td>
                                    <td align="right" style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Role</td>
                                    <td align="right" style="padding: 6px 0;">
                                        <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                                            ${formattedRole}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0 4px; font-size: 13px; color: #64748b; font-weight: 500;">Account Status</td>
                                    <td align="right" style="padding: 6px 0 4px; font-size: 13px; color: #16a34a; font-weight: 700;">
                                        ● Active
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps Box -->
                            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 14px 16px; margin-bottom: 28px;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e40af;">
                                    <strong>Next step:</strong> ${roleGuidance}
                                </p>
                            </div>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-bottom: 28px;">
                                <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
                                    Log In to KaamDaar &rarr;
                                </a>
                            </div>

                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                                If you did not create this account, please disregard this email or reach out to our support team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 500;">
                                KaamDaar • Connecting Skills, Empowering Nepal
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${currentYear} KaamDaar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    });
};

const sendMailToAdminWhenNewUserCreated = async (data) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn("ADMIN_EMAIL is not defined in environment variables. Skipping admin notification email.");
        return;
    }

    const adminUrl = process.env.CMS_URL || process.env.ADMIN_URL || "https://cms.kaamdaar.owlstip.com";
    const currentYear = new Date().getFullYear();
    const fullName = data?.fullName ? data.fullName.trim() : "New User";
    const email = data?.email || "Not provided";
    const phone = data?.phone || "Not provided";
    const role = data?.role || "USER";

    const formattedRole = role
        ? role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : "Member";

    const organizationInfo = data?.companyName
        ? `<tr>
             <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 500;">Company Name</td>
             <td align="right" style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${data.companyName}</td>
           </tr>`
        : data?.centreName
            ? `<tr>
             <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 500;">Training Centre</td>
             <td align="right" style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${data.centreName}</td>
           </tr>`
            : "";

    await transporter.sendMail({
        from: `"Kaamdaar Alerts" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `[Kaamdaar Alert] New User Registered: ${fullName} (${formattedRole})`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Registration Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
    <!-- Preheader preview text (hidden) -->
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        New registration alert: ${fullName} has registered as a ${formattedRole} on Kaamdaar.
    </div>

    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); background-color: #0f172a; padding: 32px 32px 28px; text-align: center;">
                            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                Kaamdaar</span>
                            </h1>
                            <div style="margin-top: 10px;">
                                <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #38bdf8; background-color: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Alert &bull; New Registration
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px;">
                            <!-- Alert Icon / Pill -->
                            <div style="text-align: center; margin-bottom: 18px;">
                                <div style="display: inline-block; width: 54px; height: 54px; line-height: 54px; border-radius: 50%; background-color: #eff6ff; border: 2px solid #bfdbfe; text-align: center;">
                                    <span style="font-size: 24px;">👤</span>
                                </div>
                            </div>

                            <h2 style="margin: 0 0 10px; font-size: 21px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.3;">
                                New User Registration
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 14px; color: #475569; text-align: center; line-height: 1.6;">
                                A new user has just registered on the KaamDaar platform. Review their account details below:
                            </p>

                            <!-- User Details Table -->
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; padding: 18px 20px;">
                                <tr>
                                    <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Registered Profile Information
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Full Name</td>
                                    <td align="right" style="padding: 12px 0 6px; font-size: 14px; color: #0f172a; font-weight: 600;">${fullName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Email Address</td>
                                    <td align="right" style="padding: 6px 0; font-size: 14px; color: #0284c7; font-weight: 600;">
                                        <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Phone Number</td>
                                    <td align="right" style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${phone}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Assigned Role</td>
                                    <td align="right" style="padding: 6px 0;">
                                        <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                                            ${formattedRole}
                                        </span>
                                    </td>
                                </tr>
                                ${organizationInfo}
                            </table>

                            <!-- CTA Buttons -->
                            <div style="text-align: center; margin: 28px 0 16px;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                                            <a href="${adminUrl}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                                Open Admin CMS &rarr;
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                                This is an automated notification sent to system administrators upon successful user signup.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                            <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 500;">
                                KaamDaar Admin Management System
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${currentYear} KaamDaar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    });
};

const sendEmailToAdminOnJobPosting = async (email, jobTitle, companyName, employerName) => {
    const currentYear = new Date().getFullYear();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://cms.kaamdaar.owlstip.com";
    await transporter.sendMail({
        from: `"Kaamdaar" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Job Posting: ${jobTitle}`,
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>New Job Posting Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 30px 10px;">
                <table align="center" role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700;">
                                KaamDaar Platform
                            </h1>
                            <div style="margin-top: 10px;">
                                <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #93c5fd; background-color: rgba(255, 255, 255, 0.25); border: 1px solid rgba(255, 255, 255, 0.35); padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Admin Alert &bull; New Job Posted
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px;">
                            <!-- Alert Icon / Pill -->
                            <div style="text-align: center; margin-bottom: 18px;">
                                <div style="display: inline-block; width: 54px; height: 54px; line-height: 54px; border-radius: 50%; background-color: #f0fdf4; border: 2px solid #bbf7d0; text-align: center;">
                                    <span style="font-size: 24px;">💼</span>
                                </div>
                            </div>

                            <h2 style="margin: 0 0 10px; font-size: 21px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.3;">
                                New Job Opening
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 14px; color: #475569; text-align: center; line-height: 1.6;">
                                A new job has been posted on the KaamDaar platform. Review the job details below:
                            </p>

                            <!-- Job Details Table -->
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; padding: 18px 20px;">
                                <tr>
                                    <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Job Information
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Job Title</td>
                                    <td align="right" style="padding: 12px 0 6px; font-size: 14px; color: #0f172a; font-weight: 600;">${jobTitle}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Company/Organisation</td>
                                    <td align="right" style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${companyName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Posted By</td>
                                    <td align="right" style="padding: 6px 0; font-size: 14px; color: #10b981; font-weight: 600;">
                                        ${employerName || "Employer"}
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Buttons -->
                            <div style="text-align: center; margin: 28px 0 16px;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                                            <a href="${adminUrl}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                                Open Admin CMS &rarr;
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                                This is an automated notification sent to system administrators upon successful job posting.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                            <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 500;">
                                KaamDaar Admin Management System
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${currentYear} KaamDaar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    });
}

const sendJobCreationMailToEmployer = async (email, jobTitle, companyName = "", employerName = "") => {
    const currentYear = new Date().getFullYear();
    const displayName = employerName ? employerName.trim() : "Valued Employer";

    const companyRow = companyName
        ? `<tr>
             <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Company</td>
             <td align="right" style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${companyName}</td>
           </tr>`
        : "";

    const postingDate = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Kathmandu",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    await transporter.sendMail({
        from: `"Kaamdaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Job Submitted: ${jobTitle} (Pending Admin Approval) | Kaamdaar`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Job Submitted - Pending Approval</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
    <!-- Preheader preview text (hidden) -->
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Your job posting for "${jobTitle}" has been received and will go live on Kaamdaar once approved by an administrator.
    </div>

    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); background-color: #1e3a8a; padding: 36px 32px 32px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                Kaamdaar</span>
                            </h1>
                            <p style="margin: 6px 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                                Connecting talents and opportunities
                            </p>
                            <div style="margin-top: 12px;">
                                <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #fef3c7; background-color: rgba(245, 158, 11, 0.25); border: 1px solid rgba(245, 158, 11, 0.45); padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Job Submitted &bull; Pending Approval
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px;">
                            <!-- Under Review Icon -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #fef3c7; border: 2px solid #fde68a; text-align: center;">
                                    <span style="font-size: 26px;">⏳</span>
                                </div>
                            </div>

                            <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.3;">
                                Job Submitted for Review
                            </h2>
                            <p style="margin: 0 0 16px; font-size: 15px; color: #475569; text-align: center; line-height: 1.6;">
                                Hi <strong>${displayName}</strong>, your job posting for <strong style="color: #1e293b;">${jobTitle}</strong> has been created and received.
                            </p>
                            <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; text-align: center; line-height: 1.6;">
                                To maintain a trusted and high-quality platform, all listings are reviewed by our team. <strong>Once approved by an administrator, your job will automatically go live on the site</strong> and become visible to candidates.
                            </p>

                            <!-- Job Summary Table -->
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; padding: 18px 20px;">
                                <tr>
                                    <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Submission Summary
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Job Title</td>
                                    <td align="right" style="padding: 12px 0 6px; font-size: 14px; color: #0f172a; font-weight: 600;">${jobTitle}</td>
                                </tr>
                                ${companyRow}
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Status</td>
                                    <td align="right" style="padding: 6px 0;">
                                        <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; border: 1px solid #fde68a;">
                                            ● Pending Approval
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0 4px; font-size: 13px; color: #64748b; font-weight: 500;">Date Submitted</td>
                                    <td align="right" style="padding: 6px 0 4px; font-size: 14px; color: #334155; font-weight: 600;">
                                        ${postingDate}
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps / Review Process Box -->
                            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px 18px; margin-bottom: 24px;">
                                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #92400e;">
                                    What happens next:
                                </p>
                                <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #78350f; line-height: 1.6;">
                                    <li><strong>Admin Review:</strong> Our administration team will verify the listing details.</li>
                                    <li><strong>Publication:</strong> Once approved, the job will instantly appear in search results for job seekers.</li>
                                    <li><strong>Applications:</strong> You will be able to review incoming applications directly in your employer portal.</li>
                                </ul>
                            </div>

                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                                Need to make corrections or have questions? Contact our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #2563eb; text-decoration: none;">${process.env.EMAIL_USER}</a>.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 500;">
                                KaamDaar • Connecting Skills, Empowering Nepal
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${currentYear} KaamDaar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    });
};

const sendAdminJobApprovalMail = async (status, email, jobTitle, companyName = "", employerName = "") => {
    const currentYear = new Date().getFullYear();
    const displayName = employerName ? employerName.trim() : "Valued Employer";
    const isApproved = String(status).toUpperCase() === "APPROVED";

    const companyRow = companyName
        ? `<tr>
             <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Company</td>
             <td align="right" style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${companyName}</td>
           </tr>`
        : "";

    const reviewDate = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Kathmandu",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const subject = isApproved
        ? `Job Approved & Live: ${jobTitle} 🎉 | Kaamdaar`
        : `Update on Your Job Posting: ${jobTitle} | Kaamdaar`;

    const preheader = isApproved
        ? `Great news! Your job posting for "${jobTitle}" has been approved by our admin team and is now live on Kaamdaar.`
        : `Important update: Your job posting for "${jobTitle}" was reviewed by our team and could not be approved at this time.`;

    const headerBadge = isApproved
        ? `<span style="display: inline-block; font-size: 11px; font-weight: 700; color: #dcfce7; background-color: rgba(34, 197, 94, 0.25); border: 1px solid rgba(34, 197, 94, 0.45); padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
               Admin Approved &bull; Live on Site
           </span>`
        : `<span style="display: inline-block; font-size: 11px; font-weight: 700; color: #fee2e2; background-color: rgba(239, 68, 68, 0.25); border: 1px solid rgba(239, 68, 68, 0.45); padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
               Review Complete &bull; Not Approved
           </span>`;

    const iconHtml = isApproved
        ? `<div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #ecfdf5; border: 2px solid #a7f3d0; text-align: center;">
               <span style="font-size: 26px; color: #059669;">✓</span>
           </div>`
        : `<div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #fef2f2; border: 2px solid #fecaca; text-align: center;">
               <span style="font-size: 26px; color: #dc2626;">✕</span>
           </div>`;

    const headline = isApproved
        ? `Your Job Opening is Approved & Live!`
        : `Job Posting Not Approved`;

    const mainMessage = isApproved
        ? `<p style="margin: 0 0 16px; font-size: 15px; color: #475569; text-align: center; line-height: 1.6;">
               Hi <strong>${displayName}</strong>, great news! Your job posting for <strong style="color: #1e293b;">${jobTitle}</strong> has been officially reviewed and approved by the KaamDaar administration team.
           </p>
           <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; text-align: center; line-height: 1.6;">
               The listing is now visible on the platform, and skilled candidates can discover your opportunity and submit their applications.
           </p>`
        : `<p style="margin: 0 0 16px; font-size: 15px; color: #475569; text-align: center; line-height: 1.6;">
               Hi <strong>${displayName}</strong>, thank you for submitting your job vacancy for <strong style="color: #1e293b;">${jobTitle}</strong>.
           </p>
           <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; text-align: center; line-height: 1.6;">
               After review by our moderation team, your job posting could not be approved at this time. This usually occurs if listing details require additional verification or need adjustments to align with platform policies.
           </p>`;

    const statusBadge = isApproved
        ? `<span style="display: inline-block; background-color: #ecfdf5; color: #15803d; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; border: 1px solid #86efac;">
               ● Active & Live
           </span>`
        : `<span style="display: inline-block; background-color: #fef2f2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; border: 1px solid #fecaca;">
               ● Rejected
           </span>`;

    const dateLabel = isApproved ? "Approved On" : "Reviewed On";

    const nextStepsBox = isApproved
        ? `<div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 18px; margin-bottom: 24px;">
               <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1e40af;">
                   Manage your posting:
               </p>
               <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.6;">
                   <li><strong>Review Applications:</strong> Check applicant CVs and candidate profiles from your employer dashboard.</li>
                   <li><strong>Real-time Messaging:</strong> Reach out and communicate directly with qualified job seekers.</li>
                   <li><strong>Update or Close:</strong> Edit posting details or close the listing once you've hired.</li>
               </ul>
           </div>`
        : `<div style="background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 6px; padding: 16px 18px; margin-bottom: 24px;">
               <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #9a3412;">
                   What you can do next:
               </p>
               <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #7c2d12; line-height: 1.6;">
                   <li><strong>Review Listing Guidelines:</strong> Ensure complete job descriptions, accurate role details, and verified company information.</li>
                   <li><strong>Edit & Resubmit:</strong> You can revise the job details from your employer portal and submit it again for review.</li>
                   <li><strong>Need Assistance?</strong> Reach out to our support team if you have questions or need help updating your listing.</li>
               </ul>
           </div>`;

    await transporter.sendMail({
        from: `"Kaamdaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
    <!-- Preheader preview text (hidden) -->
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader}
    </div>

    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); background-color: #1e3a8a; padding: 36px 32px 32px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                Kaamdaar</span>
                            </h1>
                            <p style="margin: 6px 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                                Connecting talents and opportunities
                            </p>
                            <div style="margin-top: 12px;">
                                ${headerBadge}
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 28px;">
                            <!-- Status Icon -->
                            <div style="text-align: center; margin-bottom: 20px;">
                                ${iconHtml}
                            </div>

                            <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.3;">
                                ${headline}
                            </h2>
                            ${mainMessage}

                            <!-- Job Summary Table -->
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; padding: 18px 20px;">
                                <tr>
                                    <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Job Details
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 6px; font-size: 13px; color: #64748b; font-weight: 500;">Job Title</td>
                                    <td align="right" style="padding: 12px 0 6px; font-size: 14px; color: #0f172a; font-weight: 600;">${jobTitle}</td>
                                </tr>
                                ${companyRow}
                                <tr>
                                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Status</td>
                                    <td align="right" style="padding: 6px 0;">
                                        ${statusBadge}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0 4px; font-size: 13px; color: #64748b; font-weight: 500;">${dateLabel}</td>
                                    <td align="right" style="padding: 6px 0 4px; font-size: 14px; color: #334155; font-weight: 600;">
                                        ${reviewDate}
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps Box -->
                            ${nextStepsBox}

                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                                Have questions regarding your job listing? Reach out to our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #2563eb; text-decoration: none;">${process.env.EMAIL_USER}</a>.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 500;">
                                KaamDaar • Connecting Skills, Empowering Nepal
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${currentYear} KaamDaar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    });
};

module.exports = {
    sendOtpEmail,
    sendPasswordResetConfirmationEmail,
    sendAccountCreationConfirmationEmail,
    sendMailToAdminWhenNewUserCreated,
    sendEmailToAdminOnJobPosting,
    sendJobCreationMailToEmployer,
    sendAdminJobApprovalMail,
};