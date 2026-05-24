package com.taskboard.service;

import com.taskboard.dto.BoardResponse;
import com.taskboard.dto.ReorderRequest;
import com.taskboard.entity.CardEntity;
import com.taskboard.entity.ColumnEntity;
import com.taskboard.repository.CardRepository;
import com.taskboard.repository.ColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final ColumnRepository columnRepository;
    private final CardRepository cardRepository;

    @Transactional(readOnly = true)
    public BoardResponse getBoard() {
        List<ColumnEntity> cols = columnRepository.findAllByOrderByPositionAsc();
        List<CardEntity> allCards = cardRepository.findAll(Sort.by("position"));

        Map<String, List<String>> colCardIds = new LinkedHashMap<>();
        for (ColumnEntity col : cols) {
            colCardIds.put(col.getId(), new ArrayList<>());
        }

        Map<String, BoardResponse.CardDto> cardsMap = new LinkedHashMap<>();
        for (CardEntity card : allCards) {
            String colId = card.getColumn().getId();
            List<String> ids = colCardIds.get(colId);
            if (ids != null) {
                ids.add(card.getId());
            }
            cardsMap.put(card.getId(),
                    new BoardResponse.CardDto(card.getId(), card.getTitle(), card.getDescription()));
        }

        Map<String, BoardResponse.ColumnDto> columnsMap = new LinkedHashMap<>();
        List<String> columnOrder = new ArrayList<>();
        for (ColumnEntity col : cols) {
            columnsMap.put(col.getId(),
                    new BoardResponse.ColumnDto(col.getId(), col.getTitle(), colCardIds.get(col.getId())));
            columnOrder.add(col.getId());
        }

        return new BoardResponse(columnsMap, cardsMap, columnOrder);
    }

    @Transactional(readOnly = true)
    public BoardResponse searchBoard(String keyword) {
        List<CardEntity> matchedCards = cardRepository.searchByKeyword(keyword);

        Set<String> matchedColumnIds = matchedCards.stream()
                .map(c -> c.getColumn().getId())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        List<ColumnEntity> allCols = columnRepository.findAllByOrderByPositionAsc();

        Map<String, List<String>> colCardIds = new LinkedHashMap<>();
        for (ColumnEntity col : allCols) {
            if (matchedColumnIds.contains(col.getId())) {
                colCardIds.put(col.getId(), new ArrayList<>());
            }
        }

        Map<String, BoardResponse.CardDto> cardsMap = new LinkedHashMap<>();
        for (CardEntity card : matchedCards) {
            String colId = card.getColumn().getId();
            colCardIds.get(colId).add(card.getId());
            cardsMap.put(card.getId(),
                    new BoardResponse.CardDto(card.getId(), card.getTitle(), card.getDescription()));
        }

        Map<String, BoardResponse.ColumnDto> columnsMap = new LinkedHashMap<>();
        List<String> columnOrder = new ArrayList<>();
        for (ColumnEntity col : allCols) {
            if (matchedColumnIds.contains(col.getId())) {
                columnsMap.put(col.getId(),
                        new BoardResponse.ColumnDto(col.getId(), col.getTitle(), colCardIds.get(col.getId())));
                columnOrder.add(col.getId());
            }
        }

        return new BoardResponse(columnsMap, cardsMap, columnOrder);
    }

    public void reorder(ReorderRequest request) {
        for (Map.Entry<String, List<String>> entry : request.getColumns().entrySet()) {
            String columnId = entry.getKey();
            List<String> cardIds = entry.getValue();
            ColumnEntity colRef = columnRepository.getReferenceById(columnId);
            for (int i = 0; i < cardIds.size(); i++) {
                String cardId = cardIds.get(i);
                CardEntity card = cardRepository.findById(cardId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Card not found: " + cardId));
                card.setColumn(colRef);
                card.setPosition(i);
            }
        }
    }
}
