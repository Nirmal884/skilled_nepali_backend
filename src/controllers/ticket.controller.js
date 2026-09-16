const TicketService = require('../services/ticket.service');

const TicketController = {
  async getCategories(req, res) {
    try {
      const categories = TicketService.getCategories();
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Ticket categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Error fetching ticket categories:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || 'Failed to retrieve ticket categories'
      });
    }
  },

  async createTicket(req, res) {
    try {
      const ticket = await TicketService.createTicket(req.body);
      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Ticket created successfully',
        data: ticket
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      const isClientError = error.message.includes('required') || error.message.includes('Invalid');
      return res.status(isClientError ? 400 : 500).json({
        success: false,
        statusCode: isClientError ? 400 : 500,
        message: error.message || 'Failed to create ticket'
      });
    }
  },

  async listTickets(req, res) {
    try {
      const result = await TicketService.listTickets(req.query);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Tickets retrieved successfully',
        data: result.tickets,
        count: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit
      });
    } catch (error) {
      console.error('Error listing tickets:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || 'Failed to retrieve tickets'
      });
    }
  },

  async getTicketDetails(req, res) {
    try {
      const { id } = req.params;
      const includeInternal = req.query.includeInternal === 'true' || req.query.scope === 'admin';
      const ticket = await TicketService.getTicketById(id, { includeInternal });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Ticket not found'
        });
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Ticket details retrieved successfully',
        data: ticket
      });
    } catch (error) {
      console.error('Error getting ticket details:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || 'Failed to retrieve ticket details'
      });
    }
  },

  async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const actorName = req.body.actorName || (req.user ? (req.user.fullName || req.user.name || 'Support Agent') : 'Support Agent');
      const updatedTicket = await TicketService.updateTicket(id, req.body, actorName);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Ticket updated successfully',
        data: updatedTicket
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      const isNotFound = error.message.includes('not found');
      const isClientError = error.message.includes('Invalid');
      const statusCode = isNotFound ? 404 : isClientError ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        statusCode,
        message: error.message || 'Failed to update ticket'
      });
    }
  },

  async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { senderType, senderName, message, isInternalNote } = req.body;

      const actorName = senderName || (req.user ? (req.user.fullName || req.user.name) : undefined);

      const result = await TicketService.addMessage(id, {
        senderType,
        senderName: actorName,
        message,
        isInternalNote
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: isInternalNote ? 'Internal note added' : 'Message posted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error adding ticket message:', error);
      const isNotFound = error.message.includes('not found');
      const isClientError = error.message.includes('empty');
      const statusCode = isNotFound ? 404 : isClientError ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        statusCode,
        message: error.message || 'Failed to post message'
      });
    }
  },

  async getTicketStats(req, res) {
    try {
      const stats = await TicketService.getTicketStats();
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Ticket statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || 'Failed to retrieve ticket statistics'
      });
    }
  }
};

module.exports = TicketController;
