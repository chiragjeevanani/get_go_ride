import Faq from '../models/Faq.model.js';
import { success, error } from '../utils/response.js';

/**
 * @route   GET /api/faqs
 * @desc    Get all FAQs (Public)
 * @access  Public
 */
export const getFaqs = async (req, res, next) => {
  try {
    let faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    
    // Seed default FAQs if the FAQ collection is completely empty
    if (faqs.length === 0) {
      const defaults = [
        { question: "How do I track my vehicle?", answer: "Go to 'Requests' and select the active request to see live tracking.", order: 1 },
        { question: "What is the cancellation policy?", answer: "Cancellations are free within 15 minutes of booking confirmation.", order: 2 },
        { question: "How to pay the vendor?", answer: "Payment can be done via app or cash to driver after loading.", order: 3 },
      ];
      await Faq.insertMany(defaults);
      faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    }

    success(res, faqs, 'FAQs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createFaq = async (req, res, next) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
      return error(res, 'Question and answer are required', 400, 'BAD_REQUEST');
    }

    const targetOrder = Number(order) || 1;

    // Shift existing items >= targetOrder up by 1
    await Faq.updateMany(
      { order: { $gte: targetOrder } },
      { $inc: { order: 1 } }
    );

    const faq = await Faq.create({ question, answer, order: targetOrder });
    success(res, faq, 'FAQ created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/faqs/:id
 * @desc    Update an FAQ (Admin only)
 * @access  Private (Admin)
 */
export const updateFaq = async (req, res, next) => {
  try {
    const { question, answer, order } = req.body;
    
    const faq = await Faq.findById(req.params.id);
    if (!faq) return error(res, 'FAQ not found', 404, 'NOT_FOUND');

    if (order !== undefined) {
      const O_old = faq.order;
      const O_new = Number(order);

      if (O_new !== O_old) {
        if (O_new > O_old) {
          // Shift items (O_old, O_new] down by 1
          await Faq.updateMany(
            { _id: { $ne: faq._id }, order: { $gt: O_old, $lte: O_new } },
            { $inc: { order: -1 } }
          );
        } else {
          // Shift items [O_new, O_old) up by 1
          await Faq.updateMany(
            { _id: { $ne: faq._id }, order: { $gte: O_new, $lt: O_old } },
            { $inc: { order: 1 } }
          );
        }
        faq.order = O_new;
      }
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;

    await faq.save();
    success(res, faq, 'FAQ updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/faqs/:id
 * @desc    Delete an FAQ (Admin only)
 * @access  Private (Admin)
 */
export const deleteFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return error(res, 'FAQ not found', 404, 'NOT_FOUND');
    success(res, null, 'FAQ deleted successfully');
  } catch (err) {
    next(err);
  }
};
