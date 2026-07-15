package com.auction.common.controller;

import com.auction.common.dto.ChatbotRequest;
import com.auction.common.dto.ChatbotResponse;
import com.auction.common.service.BidZoneChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final BidZoneChatbotService chatbotService;

    @PostMapping
    public ChatbotResponse reply(@Valid @RequestBody ChatbotRequest request) {
        return chatbotService.reply(request.getMessage());
    }
}
