package com.auction.chat.enums;

/**
 * Loại cuộc hội thoại trong hệ thống chat.
 *
 * <ul>
 *   <li>{@link #BUYER_SELLER} - Buyer ↔ Seller nhắn trực tiếp với nhau.
 *       Staff KHÔNG thấy cuộc hội thoại này; Admin thấy để giám sát.</li>
 *   <li>{@link #BUYER_STAFF} - Buyer yêu cầu hỗ trợ staff.</li>
 *   <li>{@link #SELLER_STAFF} - Seller yêu cầu hỗ trợ staff.</li>
 * </ul>
 */
public enum ConversationType {
    BUYER_SELLER,
    BUYER_STAFF,
    SELLER_STAFF
}