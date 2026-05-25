package com.taskboard.service;

import com.taskboard.dto.CreateCardRequest;
import com.taskboard.dto.EditCardRequest;
import com.taskboard.entity.CardEntity;
import com.taskboard.entity.ColumnEntity;
import com.taskboard.repository.CardRepository;
import com.taskboard.repository.ColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class CardService {

    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;

    public void createCard(CreateCardRequest req) {
        ColumnEntity col = columnRepository.findById(req.getColumnId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Column not found: " + req.getColumnId()));
        int nextPos = cardRepository.findMaxPositionByColumnId(req.getColumnId()) + 1;
        CardEntity card = new CardEntity();
        card.setId(req.getId());
        card.setTitle(req.getTitle());
        card.setDescription(req.getDescription() != null ? req.getDescription() : "");
        card.setPriority(req.getPriority() != null ? req.getPriority() : "MEDIUM");
        card.setColumn(col);
        card.setPosition(nextPos);
        cardRepository.save(card);
    }

    public void editCard(String id, EditCardRequest req) {
        CardEntity card = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: " + id));
        card.setTitle(req.getTitle());
        card.setDescription(req.getDescription() != null ? req.getDescription() : "");
        if (req.getPriority() != null) {
            card.setPriority(req.getPriority());
        }
    }

    public void deleteCard(String id) {
        if (!cardRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: " + id);
        }
        cardRepository.deleteById(id);
    }
}
