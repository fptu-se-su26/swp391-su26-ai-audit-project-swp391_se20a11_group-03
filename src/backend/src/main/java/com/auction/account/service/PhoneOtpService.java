package com.auction.account.service;

import com.auction.account.dao.UserVerificationTokenDAO;
import com.auction.account.entity.User;
import com.auction.account.entity.UserVerificationToken;
import com.auction.account.entity.VerificationType;
import com.auction.common.util.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

/**
 * Facade cho OTP xác minh số điện thoại. Ưu tiên Twilio Verify nếu đã cấu hình;
 * nếu không, tự sinh mã 6 số và gửi qua SpeedSMS. Nhờ đó khi nhóm nâng cấp
 * Twilio chỉ cần đặt biến môi trường, không phải sửa code.
 */
@Service
@RequiredArgsConstructor
public class PhoneOtpService {
    private static final int OTP_VALID_MINUTES = 5;

    private final TwilioVerifyService twilioVerifyService;
    private final SpeedSmsService speedSmsService;
    private final UserVerificationTokenDAO tokenDAO;
    private final SecureRandom random = new SecureRandom();

    public String normalizePhone(String value) {
        return twilioVerifyService.normalizePhone(value);
    }

    public void startVerification(User user, String phone, String channel) {
        if (twilioVerifyService.isConfigured()) {
            try {
                twilioVerifyService.startVerification(phone, channel);
                return;
            } catch (IllegalStateException ex) {
                // Twilio từ chối (vd. trial chặn số chưa verify) — rơi xuống SpeedSMS nếu có.
                if (!speedSmsService.isConfigured()) {
                    throw ex;
                }
            }
        }
        if (!speedSmsService.isConfigured()) {
            throw new IllegalStateException(
                    "Dịch vụ OTP chưa được cấu hình. Quản trị viên cần thiết lập Twilio Verify hoặc SpeedSMS.");
        }
        String normalizedChannel = channel == null ? "" : channel.trim().toLowerCase(Locale.ROOT);
        if ("whatsapp".equals(normalizedChannel)) {
            throw new IllegalArgumentException("Kênh WhatsApp cần Twilio. Vui lòng chọn SMS.");
        }
        String code = String.format("%06d", random.nextInt(1_000_000));
        UserVerificationToken token = new UserVerificationToken(
                user,
                otpHash(phone, code),
                VerificationType.PHONE.name(),
                LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES),
                LocalDateTime.now()
        );
        tokenDAO.save(token);
        speedSmsService.sendSms(phone,
                "BidZone: Ma xac minh cua ban la " + code
                        + ". Hieu luc " + OTP_VALID_MINUTES + " phut. Khong chia se ma nay.");
    }

    public boolean checkVerification(User user, String phone, String code) {
        if (twilioVerifyService.isConfigured() && !speedSmsService.isConfigured()) {
            return twilioVerifyService.checkVerification(phone, code);
        }
        // Thử OTP nội bộ trước (trường hợp fallback đã gửi qua SpeedSMS).
        UserVerificationToken token = tokenDAO.findByHashAndType(
                otpHash(phone, code), VerificationType.PHONE.name());
        if (token != null
                && token.getUsedAt() == null
                && token.getExpiresAt().isAfter(LocalDateTime.now())
                && token.getUser().getUserId() == user.getUserId()) {
            tokenDAO.markUsed(token.getId(), LocalDateTime.now());
            return true;
        }
        if (twilioVerifyService.isConfigured()) {
            return twilioVerifyService.checkVerification(phone, code);
        }
        return false;
    }

    private String otpHash(String phone, String code) {
        return TokenUtil.sha256(phone + ":" + code);
    }
}
