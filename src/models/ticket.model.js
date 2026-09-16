const prisma = require('../config/db');

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const TicketModel = {
  async findLatestByPrefix(prefix) {
    return await prisma.ticket.findFirst({
      where: {
        ticketNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        ticketNumber: true
      }
    });
  },

  async findByTicketNumber(ticketNumber) {
    return await prisma.ticket.findUnique({
      where: { ticketNumber }
    });
  },

  async findBasicByIdOrNumber(idOrNumber) {
    if (!idOrNumber) return null;
    const where = isUUID(idOrNumber) ? { id: idOrNumber } : { ticketNumber: idOrNumber };
    return await prisma.ticket.findFirst({ where });
  },

  async findTicketDetails(idOrNumber, options = {}) {
    if (!idOrNumber) return null;
    const where = isUUID(idOrNumber) ? { id: idOrNumber } : { ticketNumber: idOrNumber };
    const includeMessagesWhere = options.includeInternal ? {} : { isInternalNote: false };

    return await prisma.ticket.findFirst({
      where,
      include: {
        messages: {
          where: includeMessagesWhere,
          orderBy: {
            createdAt: 'asc'
          }
        },
        logs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  },

  async createTicketWithInitialMessage({ ticketData, initialMessage, initialAuditLog }) {
    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: ticketData
      });

      await tx.ticketMessage.create({
        data: {
          ...initialMessage,
          ticketId: ticket.id
        }
      });

      await tx.ticketAuditLog.create({
        data: {
          ...initialAuditLog,
          ticketId: ticket.id
        }
      });

      return ticket;
    });
  },

  async findAll({ where = {}, skip = 0, take = 10, scope }) {
    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: {
              messages: scope === 'public' ? { where: { isInternalNote: false } } : true
            }
          }
        }
      }),
      prisma.ticket.count({ where })
    ]);

    return { tickets, totalCount };
  },

  async updateWithAuditLogs(ticketId, dataToUpdate, auditLogsToCreate = []) {
    return await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: dataToUpdate
      });

      for (const log of auditLogsToCreate) {
        await tx.ticketAuditLog.create({ data: log });
      }

      return updatedTicket;
    });
  },

  async addMessageWithAudit({ ticketId, messageData, auditLogData, statusUpdate }) {
    return await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.ticketMessage.create({
        data: {
          ...messageData,
          ticketId
        }
      });

      await tx.ticketAuditLog.create({
        data: {
          ...auditLogData,
          ticketId
        }
      });

      let newStatus = null;
      if (statusUpdate) {
        newStatus = statusUpdate;
        await tx.ticket.update({
          where: { id: ticketId },
          data: { status: statusUpdate }
        });

        await tx.ticketAuditLog.create({
          data: {
            ticketId,
            actorName: auditLogData.actorName,
            action: 'STATUS_CHANGE',
            oldValue: 'WAITING_ON_USER',
            newValue: statusUpdate
          }
        });
      } else {
        await tx.ticket.update({
          where: { id: ticketId },
          data: { updatedAt: new Date() }
        });
      }

      return {
        message: createdMessage,
        ticketStatus: newStatus
      };
    });
  },

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      waitingOnUserTickets,
      resolvedTickets,
      closedTickets,
      cancelledTickets,
      resolvedTodayTickets,
      employerTickets,
      jobseekerTickets,
      trainingCentreTickets,
      lowTickets,
      mediumTickets,
      highTickets,
      urgentTickets
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: 'WAITING_ON_USER' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } }),
      prisma.ticket.count({ where: { status: 'CANCELLED' } }),
      prisma.ticket.count({
        where: {
          status: 'RESOLVED',
          updatedAt: { gte: today }
        }
      }),
      prisma.ticket.count({ where: { userType: 'EMPLOYER' } }),
      prisma.ticket.count({ where: { userType: 'JOBSEEKER' } }),
      prisma.ticket.count({ where: { userType: 'TRAINING_CENTRE' } }),
      prisma.ticket.count({ where: { priority: 'LOW' } }),
      prisma.ticket.count({ where: { priority: 'MEDIUM' } }),
      prisma.ticket.count({ where: { priority: 'HIGH' } }),
      prisma.ticket.count({ where: { priority: 'URGENT' } })
    ]);

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      waitingOnUserTickets,
      resolvedTickets,
      closedTickets,
      cancelledTickets,
      resolvedTodayTickets,
      byUserType: {
        EMPLOYER: employerTickets,
        JOBSEEKER: jobseekerTickets,
        TRAINING_CENTRE: trainingCentreTickets
      },
      byPriority: {
        LOW: lowTickets,
        MEDIUM: mediumTickets,
        HIGH: highTickets,
        URGENT: urgentTickets
      }
    };
  }
};

module.exports = TicketModel;
