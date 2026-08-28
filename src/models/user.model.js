const prisma = require("../config/db");
const { countryOptions, gccCountryOptions } = require("../data/countryData");

const UserModel = {
    async createUser(data) {
        const filteredData = {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            country: data.country,
            role: data.role,
            phone: data.phone,
            experience: data.experience,
            pastExperience: data.pastExperience,
            resume: data.resume,
            companyName: data.companyName,
            designation: data.designation,
            companyLogo: data.companyLogo,
            centreName: data.centreName,
            centreLogo: data.centreLogo,
        };
        if (data.jobCategoryIds) {
            const ids = Array.isArray(data.jobCategoryIds) ? data.jobCategoryIds : [data.jobCategoryIds];
            filteredData.jobCategories = { connect: ids.map(id => ({ id })) };
        }
        if (data.applicantTypeId) {
            filteredData.applicantType = { connect: { id: data.applicantTypeId } };
        }

        if (data.role === "JOBSEEKER") {
            filteredData.isAdminApproved = true;
        }

        const userData = await prisma.user.create({
            data: filteredData
        })
        return userData;
    },

    async sendOtpForPasswordChange(number) {
        const user = await prisma.user.findFirst({
            where: { phone: number, deletedAt: null }
        })
        if (!user) {
            throw new Error("User not found");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(otp, "OTP")
        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                otp: otp,
                otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
            }
        })
        return updatedUser;
    },

    async verifyOtpForPasswordChange(number, otp) {
        const user = await prisma.user.findFirst({
            where: { phone: number, otp: otp, deletedAt: null }
        })
        if (!user) {
            throw new Error("Invalid OTP");
        }
        if (user.otpExpiry < new Date()) {
            throw new Error("OTP expired");
        }
        return user;
    },

    async changePassword(userId, password) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { password: password }
        })
        return user;
    },

    async updateLogo(userId, role, logo) {
        const data = {};
        if (role === "EMPLOYER") {
            data.companyLogo = logo;
        } else if (role === "TRAINING_CENTRE") {
            data.centreLogo = logo;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data
        })
        return updatedUser;
    },

    async updateResume(userId, resumePath) {
        return await prisma.user.update({
            where: { id: userId },
            data: { resume: resumePath }
        });
    },

    async findUserByEmail(email) {
        const userList = await prisma.user.findFirst({
            where: { email: email, deletedAt: null }
        })
        // console.log(userList, "UserList")
        return userList;
    },

    async getAllUsers(role, search, page, limit) {

        const roleCondition = role === 'ADMIN'
            ? { not: 'ADMIN' }
            : role;

        const whereClause = {
            deletedAt: null,
            role: roleCondition
        };

        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { centreName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, count] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereClause,
                include: {
                    subscriptions: true
                },
                skip: page ? (page - 1) * limit : 0,
                take: limit ? limit : 10,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        const cleanedUser = users?.map(({ password, ...user }) => user)
        return { users: cleanedUser, count };
    },

    async deleteUser(userId) {
        const deletedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedUser;
    },

    async verifyPhone(phone) {
        const userList = await prisma.user.findFirst({
            where: { phone: phone, deletedAt: null }
        })
        console.log(userList, "PHONE VERIFY")
        return userList;

    },

    async getUserProfile(userId) {
        const allCountries = [...countryOptions, ...gccCountryOptions];

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                jobCategories: {
                    select: {
                        id: true,
                        categoryName: true
                    },
                },
                applicantType: {
                    select: {
                        id: true,
                        applicantTypeName: true
                    }
                },
                educations: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        institution: true,
                        fieldOfStudy: true,
                        startDate: true,
                        endDate: true,
                        isCompleted: true,
                    },
                    orderBy: {
                        endDate: 'desc'
                    }
                },
                workExperiences: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        title: true,
                        companyName: true,
                        startDate: true,
                        endDate: true,
                        isCurrent: true,
                        description: true
                    }
                },
                certifications: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        certificationName: true,
                        issuingAuthority: true,
                        issueDate: true,
                    }
                },
                skills: {
                    select: {
                        id: true,
                        skillName: true
                    }
                },
                subscriptions: true,
                companyProfile: true
            }
        });

        if (!user) return null;

        const certificationsCount = user.certifications?.length || 0;
        let skillBadge = null;
        if (certificationsCount >= 3) {
            skillBadge = {
                level: 3,
                name: "Gold Expert",
                color: "#ca8a04",
                description: "Completed 3 or more courses"
            };
        } else if (certificationsCount === 2) {
            skillBadge = {
                level: 2,
                name: "Silver Achiever",
                color: "#475569",
                description: "Completed 2 courses"
            };
        } else if (certificationsCount === 1) {
            skillBadge = {
                level: 1,
                name: "Bronze Starter",
                color: "#d97706",
                description: "Completed 1 course"
            };
        }

        const mappedUser = {
            ...user,
            country: allCountries.find(item => item.value === user.country)?.label || user.country,
            skillBadge
        };

        delete mappedUser.password;
        delete mappedUser.applicantTypeId;

        return mappedUser;
    },

    // async updateProfile(userId, data) {
    //     const updateUser = await prisma.user.update({
    //         where: {
    //             id: userId
    //         },
    //         data: {
    //             ...(data.fullName && { fullName: data.fullName }),
    //             ...(data.title && { title: data.title }),
    //             ...(data.bio && { bio: data.bio }),
    //             ...(data.email && { email: data.email }),
    //             ...(data.phone && { phone: data.phone }),
    //             ...(data.skills && {
    //                 skills: {
    //                     set: data.skills.map(skill => ({ id: skill.id }))
    //                 }
    //             })
    //         }
    //     })
    //     return updateUser;
    // },

    async updateProfile(userId, data) {
        const updateData = {};

        // General fields
        if (data.fullName !== undefined) updateData.fullName = data.fullName;
        if (data.name !== undefined) updateData.fullName = data.name;
        if (data.title !== undefined) updateData.title = data.title;
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.pastExperience !== undefined) updateData.pastExperience = data.pastExperience;
        if (data.resume !== undefined) updateData.resume = data.resume;
        if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;

        // Employer & Training Centre specific fields
        if (data.companyName !== undefined) updateData.companyName = data.companyName;
        if (data.designation !== undefined) updateData.designation = data.designation;
        if (data.companyLogo !== undefined) updateData.companyLogo = data.companyLogo;
        if (data.centreName !== undefined) updateData.centreName = data.centreName;
        if (data.centreLogo !== undefined) updateData.centreLogo = data.centreLogo;
        if (data.businessDocument !== undefined) updateData.businessDocument = data.businessDocument;
        if (data.verificationStatus !== undefined) updateData.verificationStatus = data.verificationStatus;

        // Parse country safely
        const allCountries = [...countryOptions, ...gccCountryOptions];
        if (data.country !== undefined && data.country !== null && data.country !== '') {
            let parsedCountry = parseInt(data.country, 10);
            if (isNaN(parsedCountry)) {
                // If it is a string label (e.g. "Nepal"), look up the numeric value
                const foundCountry = allCountries.find(
                    item => item.label.toLowerCase() === String(data.country).toLowerCase()
                );
                if (foundCountry) {
                    parsedCountry = foundCountry.value;
                }
            }
            if (!isNaN(parsedCountry)) {
                updateData.country = parsedCountry;
            }
        }

        // Parse experience safely
        if (data.experience !== undefined) {
            if (data.experience === null || data.experience === '') {
                updateData.experience = null;
            } else {
                const parsedExperience = parseFloat(data.experience);
                if (!isNaN(parsedExperience)) {
                    updateData.experience = parsedExperience;
                }
            }
        }

        // Parse jobCategories safely
        if (data.jobCategories !== undefined) {
            const categories = Array.isArray(data.jobCategories) ? data.jobCategories : [];
            const ids = categories.map(cat => (typeof cat === 'object' && cat ? cat.id : cat)).filter(Boolean);
            updateData.jobCategories = { set: ids.map(id => ({ id })) };
        } else if (data.jobCategoryIds !== undefined) {
            const ids = Array.isArray(data.jobCategoryIds) ? data.jobCategoryIds : (data.jobCategoryIds ? [data.jobCategoryIds] : []);
            updateData.jobCategories = { set: ids.map(id => ({ id })) };
        }

        // Parse applicantType safely
        if (data.applicantTypeId !== undefined) {
            if (data.applicantTypeId) {
                updateData.applicantType = { connect: { id: data.applicantTypeId } };
            } else {
                updateData.applicantType = { disconnect: true };
            }
        }

        // Parse skills safely
        let skillsArray = null;
        if (data.skills) {
            if (Array.isArray(data.skills)) {
                skillsArray = data.skills;
            } else if (typeof data.skills === 'string') {
                try {
                    skillsArray = JSON.parse(data.skills);
                } catch (e) {
                    skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
        }

        if (skillsArray && Array.isArray(skillsArray)) {
            const skillsToConnect = [];
            for (const skill of skillsArray) {
                const skillStr = typeof skill === 'object' && skill ? skill.skillName : skill;
                if (!skillStr) continue;

                let existing = await prisma.skill.findFirst({
                    where: {
                        skillName: {
                            equals: skillStr,
                            mode: "insensitive"
                        }
                    }
                });

                if (!existing) {
                    existing = await prisma.skill.create({
                        data: { skillName: skillStr }
                    });
                }
                skillsToConnect.push({ id: existing.id });
            }
            updateData.skills = { set: skillsToConnect };
        }

        // Upsert nested CompanyProfile
        if (data.address !== undefined || data.about !== undefined || data.website !== undefined || data.latitude !== undefined || data.longitude !== undefined) {
            const companyProfileData = {
                ...(data.address !== undefined && { address: data.address }),
                ...(data.about !== undefined && { about: data.about }),
                ...(data.website !== undefined && { website: data.website }),
            };

            if (data.latitude !== undefined) {
                if (data.latitude === null || data.latitude === '') {
                    companyProfileData.latitude = null;
                } else {
                    const parsedLat = parseFloat(data.latitude);
                    if (!isNaN(parsedLat)) {
                        companyProfileData.latitude = parsedLat;
                    }
                }
            }

            if (data.longitude !== undefined) {
                if (data.longitude === null || data.longitude === '') {
                    companyProfileData.longitude = null;
                } else {
                    const parsedLng = parseFloat(data.longitude);
                    if (!isNaN(parsedLng)) {
                        companyProfileData.longitude = parsedLng;
                    }
                }
            }

            await prisma.companyProfile.upsert({
                where: { userId: userId },
                update: companyProfileData,
                create: {
                    userId: userId,
                    address: data.address || "",
                    about: data.about || "",
                    website: data.website || "",
                    latitude: companyProfileData.latitude,
                    longitude: companyProfileData.longitude,
                }
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return updatedUser;
    },

    async createOrUpdateExperience(userId, data) {
        const { id, title, companyName, startDate, endDate, isCurrent, description } = data;
        if (id) {
            const updatedExperience = await prisma.workExperience.update({
                where: {
                    id: id
                },
                data: {
                    title: title,
                    companyName: companyName,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : null,
                    isCurrent: isCurrent,
                    description: description
                }
            })
            return updatedExperience;
        } else {
            const createdExperience = await prisma.workExperience.create({
                data: {
                    userId: userId,
                    title: title,
                    companyName: companyName,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : null,
                    isCurrent: isCurrent,
                    description: description
                }
            })
            return createdExperience;
        }
    },

    async deleteExperience(experienceId) {
        const deletedExperience = await prisma.workExperience.update({
            where: {
                id: experienceId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedExperience;
    },

    async createOrUpdateEducation(userId, data) {
        const { id, fieldOfStudy, institution, startDate, endDate, isCompleted } = data;
        if (id) {
            const updateEducation = await prisma.education.update({
                where: {
                    id: id
                },
                data: {
                    fieldOfStudy: fieldOfStudy,
                    institution: institution,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : null,
                    isCompleted: isCompleted
                }
            })
            return updateEducation;
        } else {
            const createEducation = await prisma.education.create({
                data: {
                    userId: userId,
                    fieldOfStudy: fieldOfStudy,
                    institution: institution,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : null,
                    isCompleted: isCompleted
                }
            })
            return createEducation;
        }
    },

    async deleteEducation(educationId) {
        const deletedEducation = await prisma.education.update({
            where: {
                id: educationId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedEducation;
    },

    async createOrUpdateCertification(userId, data) {
        const { id, certificationName, issuingAuthority, issueDate } = data;
        if (id) {
            const updateCertification = await prisma.certifications.update({
                where: {
                    id: id
                },
                data: {
                    certificationName: certificationName,
                    issuingAuthority: issuingAuthority,
                    issueDate: issueDate ? new Date(issueDate) : undefined
                }
            })
            return updateCertification;
        } else {
            const createCertification = await prisma.certifications.create({
                data: {
                    userId: userId,
                    certificationName: certificationName,
                    issuingAuthority: issuingAuthority,
                    issueDate: issueDate ? new Date(issueDate) : undefined
                }
            })
            return createCertification;
        }
    },

    async deleteCertification(certificationId) {
        const deletedCertification = await prisma.certifications.update({
            where: {
                id: certificationId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedCertification;
    },

    async listAllUsersForDropdown(page, limit, role) {
        return await prisma.$transaction(async (prisma) => {
            const users = await prisma.user.findMany({
                where: { deletedAt: null, role: role },
                skip: page && limit ? (page - 1) * limit : 0,
                take: page && limit ? limit : undefined,
                select: {
                    id: true,
                    centreName: true,
                }
            });
            const count = await prisma.user.count({
                where: { deletedAt: null, role: role },
            });
            return { users, count };
        });
    },

    async updateVerificationDocument(userId, docUrl) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                businessDocument: docUrl,
                verificationStatus: "PENDING"
            }
        });
    },

    async adminVerifyUser(userId, updateData) {
        return await prisma.user.update({
            where: { id: userId },
            data: updateData
        });
    },

    async clearResume(userId) {
        return await prisma.$transaction([
            prisma.workExperience.deleteMany({ where: { userId } }),
            prisma.education.deleteMany({ where: { userId } }),
            prisma.certifications.deleteMany({ where: { userId } }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    title: '',
                    bio: '',
                    phone: '',
                    skills: { set: [] }
                }
            })
        ]);
    }
}
module.exports = UserModel;