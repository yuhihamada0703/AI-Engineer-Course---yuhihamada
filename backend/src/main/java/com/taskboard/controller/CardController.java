package com.taskboard.controller;

import com.taskboard.dto.CreateCardRequest;
import com.taskboard.dto.EditCardRequest;
import com.taskboard.dto.SuccessResponse;
import com.taskboard.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SuccessResponse createCard(@Valid @RequestBody CreateCardRequest request) {
        cardService.createCard(request);
        return SuccessResponse.ok();
    }

    @PatchMapping("/{id}")
    public SuccessResponse editCard(@PathVariable String id,
                                    @Valid @RequestBody EditCardRequest request) {
        cardService.editCard(id, request);
        return SuccessResponse.ok();
    }

    @DeleteMapping("/{id}")
    public SuccessResponse deleteCard(@PathVariable String id) {
        cardService.deleteCard(id);
        return SuccessResponse.ok();
    }
}
