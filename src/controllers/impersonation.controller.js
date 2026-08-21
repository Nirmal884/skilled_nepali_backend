const prisma = require("../config/db");
const jwt = require("jsonwebtoken");

const ImpersonationController = {
    async impersonateUser(req, res) {
        try {
            const { targetUserId } = req.body;
            const adminId = req.user.id;

            if (!targetUserId) {
                return res.status(400).json({ success: false, message: "Target user ID is required" });
            }

            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ success: false, message: "Forbidden: Superadmin access required" });
            }

            const targetUser = await prisma.user.findUnique({
                where: { id: targetUserId, deletedAt: null }
            });

            if (!targetUser) {
                return res.status(404).json({ success: false, message: "Target user not found" });
            }

            if (targetUser.role === "ADMIN") {
                return res.status(400).json({ success: false, message: "Cannot impersonate other administrator accounts" });
            }

            const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
            await prisma.impersonationLog.create({
                data: {
                    adminId,
                    targetUserId,
                    action: "START_IMPERSONATION",
                    ipAddress: String(ipAddress)
                }
            });

            const originalAdminToken = req.cookies.token;
            res.cookie("admin_token", originalAdminToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            const impersonationToken = jwt.sign({
                id: targetUser.id,
                email: targetUser.email,
                role: targetUser.role,
                name: targetUser.fullName,
                companyName: targetUser.companyName,
                companyLogo: targetUser.companyLogo,
                centreName: targetUser.centreName,
                centreLogo: targetUser.centreLogo,
                resume: targetUser.resume,
                isImpersonated: true,
                impersonatedBy: adminId
            }, process.env.JWT_SECRET, { expiresIn: "2h" });

            res.cookie("token", impersonationToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 2 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success: true,
                message: `Successfully logged in as ${targetUser.fullName}`,
                user: {
                    id: targetUser.id,
                    email: targetUser.email,
                    role: targetUser.role,
                    fullName: targetUser.fullName,
                    isImpersonated: true
                }
            });
        } catch (error) {
            console.error("Impersonation Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    async stopImpersonating(req, res) {
        try {
            const adminToken = req.cookies.admin_token;
            if (!adminToken) {
                return res.status(400).json({ success: false, message: "No active admin session found to restore" });
            }

            let targetUserId = "";
            try {
                const decoded = jwt.decode(req.cookies.token);
                if (decoded) {
                    targetUserId = decoded.id;
                }
            } catch (e) {
            }

            let adminId = "";
            try {
                const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
                adminId = decodedAdmin.id;
            } catch (e) {
            }

            if (adminId && targetUserId) {
                const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
                await prisma.impersonationLog.create({
                    data: {
                        adminId,
                        targetUserId,
                        action: "STOP_IMPERSONATION",
                        ipAddress: String(ipAddress)
                    }
                });
            }

            res.cookie("token", adminToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 24 * 60 * 60 * 1000
            });

            res.clearCookie("admin_token");

            return res.status(200).json({
                success: true,
                message: "Impersonation ended. Admin session restored."
            });
        } catch (error) {
            console.error("Stop Impersonation Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
};

module.exports = ImpersonationController;
