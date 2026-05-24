package com.taskboard.controller;

import com.taskboard.dto.CreateCardRequest;
import com.taskboard.dto.EditCardRequest;
import com.taskboard.dto.SuccessResponse;
import com.taskboard.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    public SuccessResponse createCard(@RequestBody CreateCardRequest request) {
        cardService.createCard(request);
        return SuccessResponse.ok();
    }

    @PatchMapping("/{id}")
    public SuccessResponse editCard(@PathVariable String id,
                                    @RequestBody EditCardRequest request) {
        cardService.editCard(id, request);
        return SuccessResponse.ok();
    }

    @DeleteMapping("/{id}")
    public SuccessResponse deleteCard(@PathVariable String id) {
        cardService.deleteCard(id);
        return SuccessResponse.ok();
    }
}
