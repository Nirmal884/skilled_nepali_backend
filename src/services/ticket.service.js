const TicketModel = require('../models/ticket.model');

const CATEGORIES = {
  EMPLOYER: [
    {
      id: 'job_postings',
      name: 'Job Postings & Visibility',
      description: 'Issues publishing, editing, or promoting job vacancies.',
      referenceLabel: 'Job ID or Vacancy Title'
    },
    {
      id: 'candidate_disputes',
      name: 'Candidate Disputes',
      description: 'Candidate no-shows, interview disputes, or misconduct.',
      referenceLabel: 'Candidate Name or Application ID'
    },
    {
      id: 'company_verification',
      name: 'Company Verification',
      description: 'Document verification, company profile updates.',
      referenceLabel: 'Registration Number or Document Ref'
    },
    {
      id: 'billing_invoices',
      name: 'Billing & Invoices',
      description: 'Invoicing issues, payment discrepancies, subscription help.',
      referenceLabel: 'Invoice ID or Transaction Ref'
    }
  ],
  JOBSEEKER: [
    {
      id: 'applications_interviews',
      name: 'Applications & Interviews',
      description: 'Application submission issues, employer responsiveness, interview discrepancies.',
      referenceLabel: 'Application ID or Job Title'
    },
    {
      id: 'profile_resume_verification',
      name: 'Profile & Resume Verification',
      description: 'Skill badges, certificate uploads, profile corrections.',
      referenceLabel: 'Profile Field or Skill Name'
    },
    {
      id: 'job_alerts',
      name: 'Job Alerts',
      description: 'SMS / Email notification issues.',
      referenceLabel: 'Registered Mobile Number or Email'
    },
    {
      id: 'report_scam_fraud',
      name: 'Report Scam / Fraud',
      description: 'Suspicious postings or unauthorized payment demands.',
      referenceLabel: 'Job ID or Employer Name'
    }
  ],
  TRAINING_CENTRE: [
    {
      id: 'course_batch_listings',
      name: 'Course & Batch Listings',
      description: 'Publishing training programs and schedules.',
      referenceLabel: 'Course ID or Batch Code'
    },
    {
      id: 'student_enrollments',
      name: 'Student Enrollments',
      description: 'Trainee referrals and placement tracking.',
      referenceLabel: 'Student Name or Enrollment ID'
    },
    {
      id: 'accreditation_partner_status',
      name: 'Accreditation & Partner Status',
      description: 'Submitting training center credentials.',
      referenceLabel: 'Accreditation Number'
    },
    {
      id: 'certificates',
      name: 'Certificates',
      description: 'Uploading completion records and batch verification.',
      referenceLabel: 'Batch ID or Certificate Ref'
    }
  ]
};

const USER_TYPE_PREFIX = {
  EMPLOYER: 'K-EMP-',
  JOBSEEKER: 'K-JOB-',
  TRAINING_CENTRE: 'K-TRN-'
};

class TicketService {
  getCategories() {
    return CATEGORIES;
  }

  async generateTicketNumber(userType) {
    const prefix = USER_TYPE_PREFIX[userType] || 'K-GEN-';

    // Find the latest ticket created with this prefix
    const latestTicket = await TicketModel.findLatestByPrefix(prefix);

    let nextNumber = 1001;
    if (latestTicket && latestTicket.ticketNumber) {
      const parts = latestTicket.ticketNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextNumber = lastSeq + 1;
      }
    }

    // Ensure uniqueness with collision fallback
    let ticketNumber = `${prefix}${nextNumber}`;
    let exists = await TicketModel.findByTicketNumber(ticketNumber);
    while (exists) {
      nextNumber += 1;
      ticketNumber = `${prefix}${nextNumber}`;
      exists = await TicketModel.findByTicketNumber(ticketNumber);
    }

    return ticketNumber;
  }

  async createTicket(data) {
    const { userType, name, email, phone, subject, description, category, priority, referenceId } = data;

    if (!userType || !name || !email || !subject || !description || !category) {
      throw new Error('userType, name, email, subject, description, and category are required');
    }

    const validUserTypes = ['EMPLOYER', 'JOBSEEKER', 'TRAINING_CENTRE'];
    if (!validUserTypes.includes(userType)) {
      throw new Error(`Invalid userType: ${userType}. Must be one of ${validUserTypes.join(', ')}`);
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const chosenPriority = priority && validPriorities.includes(priority.toUpperCase())
      ? priority.toUpperCase()
      : 'MEDIUM';

    const ticketNumber = await this.generateTicketNumber(userType);

    const ticket = await TicketModel.createTicketWithInitialMessage({
      ticketData: {
        ticketNumber,
        userType,
        name,
        email,
        phone: phone || null,
        subject,
        description,
        category,
        priority: chosenPriority,
        status: 'OPEN',
        referenceId: referenceId || null
      },
      initialMessage: {
        senderType: 'USER',
        senderName: name,
        message: description,
        isInternalNote: false
      },
      initialAuditLog: {
        actorName: name,
        action: 'TICKET_CREATED',
        oldValue: null,
        newValue: 'OPEN'
      }
    });

    return await TicketModel.findTicketDetails(ticket.id, { includeInternal: true });
  }

  async listTickets(query = {}) {
    const {
      page = 1,
      limit = 10,
      userType,
      status,
      priority,
      search,
      email,
      scope
    } = query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * pageSize;

    const where = {};

    if (userType && userType !== 'ALL') {
      where.userType = userType;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (email) {
      where.email = {
        equals: email.trim(),
        mode: 'insensitive'
      };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { ticketNumber: { contains: term, mode: 'insensitive' } },
        { subject: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
        { referenceId: { contains: term, mode: 'insensitive' } }
      ];
    }

    const { tickets, totalCount } = await TicketModel.findAll({
      where,
      skip,
      take: pageSize,
      scope
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      tickets,
      totalCount,
      totalPages,
      currentPage: pageNumber,
      limit: pageSize
    };
  }

  async getTicketById(idOrNumber, options = {}) {
    if (!idOrNumber) {
      throw new Error('Ticket ID or Ticket Number is required');
    }

    return await TicketModel.findTicketDetails(idOrNumber, options);
  }

  async updateTicket(idOrNumber, updates = {}, actorName = 'System') {
    const existingTicket = await TicketModel.findBasicByIdOrNumber(idOrNumber);
    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    const dataToUpdate = {};
    const auditLogsToCreate = [];

    // Status change
    if (updates.status && updates.status !== existingTicket.status) {
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED', 'CANCELLED'];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}`);
      }
      dataToUpdate.status = updates.status;
      auditLogsToCreate.push({
        ticketId: existingTicket.id,
        actorName,
        action: 'STATUS_CHANGE',
        oldValue: existingTicket.status,
        newValue: updates.status
      });
    }

    // Priority change
    if (updates.priority && updates.priority !== existingTicket.priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(updates.priority)) {
        throw new Error(`Invalid priority: ${updates.priority}`);
      }
      dataToUpdate.priority = updates.priority;
      auditLogsToCreate.push({
        ticketId: existingTicket.id,
        actorName,
        action: 'PRIORITY_CHANGE',
        oldValue: existingTicket.priority,
        newValue: updates.priority
      });
    }

    // Assignee change
    if (updates.assigneeName !== undefined && updates.assigneeName !== existingTicket.assigneeName) {
      dataToUpdate.assigneeName = updates.assigneeName || null;
      auditLogsToCreate.push({
        ticketId: existingTicket.id,
        actorName,
        action: 'ASSIGNED',
        oldValue: existingTicket.assigneeName || 'Unassigned',
        newValue: updates.assigneeName || 'Unassigned'
      });
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await TicketModel.updateWithAuditLogs(existingTicket.id, dataToUpdate, auditLogsToCreate);
    }

    return await TicketModel.findTicketDetails(existingTicket.id, { includeInternal: true });
  }

  async addMessage(idOrNumber, messageData) {
    const { senderType, senderName, message, isInternalNote = false } = messageData;

    if (!message || !message.trim()) {
      throw new Error('Message content cannot be empty');
    }

    const ticket = await TicketModel.findBasicByIdOrNumber(idOrNumber);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const sender = senderType || 'USER';
    const author = senderName || (sender === 'AGENT' ? 'Support Agent' : ticket.name);

    // Audit log creation based on message type
    let auditAction = 'USER_REPLIED';
    if (isInternalNote) {
      auditAction = 'NOTE_ADDED';
    } else if (sender === 'AGENT') {
      auditAction = 'AGENT_REPLIED';
    }

    const payload = {
      messageData: {
        senderType: sender,
        senderName: author,
        message: message.trim(),
        isInternalNote: Boolean(isInternalNote)
      },
      auditLogData: {
        actorName: author,
        action: auditAction,
        oldValue: null,
        newValue: isInternalNote ? 'Internal Note added' : 'Public Reply posted'
      }
    };

    // State machine automation:
    // If user replies and the ticket was in WAITING_ON_USER status,
    // transition status back to IN_PROGRESS automatically.
    let statusUpdate = null;
    let newStatus = ticket.status;
    if (sender === 'USER' && ticket.status === 'WAITING_ON_USER') {
      statusUpdate = 'IN_PROGRESS';
      newStatus = 'IN_PROGRESS';
    }

    const result = await TicketModel.addMessageWithAudit({
      ticketId: ticket.id,
      messageData: payload.messageData,
      auditLogData: payload.auditLogData,
      statusUpdate
    });

    return {
      message: result.message,
      ticketStatus: newStatus
    };
  }

  async getTicketStats() {
    return await TicketModel.getStats();
  }
}

module.exports = new TicketService();
