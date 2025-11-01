import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateContactMessageUseCase } from '@application/usecases/contact/CreateContactMessageUseCase';
import { GetContactMessagesUseCase } from '@application/usecases/contact/GetContactMessagesUseCase';
import { UpdateContactMessageStatusUseCase } from '@application/usecases/contact/UpdateContactMessageStatusUseCase';
import { DeleteContactMessageUseCase } from '@application/usecases/contact/DeleteContactMessageUseCase';

export class ContactController {
  constructor(
    private createContactMessageUseCase: CreateContactMessageUseCase,
    private getContactMessagesUseCase: GetContactMessagesUseCase,
    private updateContactMessageStatusUseCase: UpdateContactMessageStatusUseCase,
    private deleteContactMessageUseCase: DeleteContactMessageUseCase
  ) {}

  submitContactForm = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
      return;
    }

    // Save to database
    const contactMessage = await this.createContactMessageUseCase.execute({
      name,
      email,
      subject,
      message
    });

    console.log('Contact form submission saved:', contactMessage.id);

    // TODO: Implement email sending logic here
    // Example: await this.emailService.sendContactForm({ name, email, subject, message });

    res.status(200).json({
      status: 'success',
      message: 'Contact form submitted successfully',
      data: contactMessage
    });
  });

  getContactMessages = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.getContactMessagesUseCase.execute(page, limit);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  updateContactStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
      return;
    }

    const updated = await this.updateContactMessageStatusUseCase.execute(id, { status });

    if (!updated) {
      res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updated
    });
  });

  deleteContactMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deleted = await this.deleteContactMessageUseCase.execute(id);

    if (!deleted) {
      res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact message deleted successfully'
    });
  });
}
