package org.example.backend.ai;

/**
 * Hằng số dùng chung cho module Chatbot AI định giá.
 */
public final class AiConstants {

    private AiConstants() {}

    /** Username của "người dùng" đại diện cho bot AI (để lưu tin nhắn bot vào bảng Messages). */
    public static final String BOT_USERNAME = "ai_pricing_bot";

    /** Tiêu đề mặc định cho hội thoại với trợ lý định giá. */
    public static final String CONVERSATION_SUBJECT = "Trợ lý định giá AI";

    /** Số tin nhắn gần nhất tối đa được gửi kèm cho AI làm ngữ cảnh. */
    public static final int MAX_HISTORY = 20;
}
