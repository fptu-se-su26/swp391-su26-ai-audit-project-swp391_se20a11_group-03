package com.auction.account.controller;

import com.auction.account.service.FptAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class FptAiHealthController {
    private final FptAiService fptAiService;

    @GetMapping(value = "/fpt-ai-health", produces = MediaType.APPLICATION_JSON_VALUE)
    public FptAiService.FptAiResult healthCheck() {
        return fptAiService.healthCheck();
    }
}



