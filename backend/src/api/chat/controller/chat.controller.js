import {
  createConversationService,
  getRecentConversationRows,
} from "../service/chat.service.js";

export async function createConversationController(req, res, next) {
  try {
    const { question } = req.body;

    const result = await createConversationService(question);

    return res.status(201).json({
      status: true,
      message: "Conversation created successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getConversationsController(req, res, next) {
  try {
    const result = await getRecentConversationRows(100);

    return res.status(200).json({
      status: true,
      message: "Conversations retrieved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}