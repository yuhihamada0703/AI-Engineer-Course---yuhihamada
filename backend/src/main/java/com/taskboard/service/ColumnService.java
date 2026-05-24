package com.taskboard.service;

import com.taskboard.dto.CreateColumnRequest;
import com.taskboard.dto.RenameColumnRequest;
import com.taskboard.entity.ColumnEntity;
import com.taskboard.repository.ColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class ColumnService {

    private final ColumnRepository columnRepository;

    public void createColumn(CreateColumnRequest req) {
        int nextPos = columnRepository.findMaxPosition() + 1;
        ColumnEntity col = new ColumnEntity();
        col.setId(req.getId());
        col.setTitle(req.getTitle());
        col.setPosition(nextPos);
        col.setCards(new ArrayList<>());
        columnRepository.save(col);
    }

    public void renameColumn(String id, RenameColumnRequest req) {
        ColumnEntity col = columnRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found: " + id));
        col.setTitle(req.getTitle());
    }

    public void deleteColumn(String id) {
        if (!columnRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found: " + id);
        }
        columnRepository.deleteById(id);
    }
}
