package com.taskboard.controller;

import com.taskboard.dto.CreateColumnRequest;
import com.taskboard.dto.RenameColumnRequest;
import com.taskboard.dto.SuccessResponse;
import com.taskboard.service.ColumnService;
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
@RequestMapping("/api/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SuccessResponse createColumn(@Valid @RequestBody CreateColumnRequest request) {
        columnService.createColumn(request);
        return SuccessResponse.ok();
    }

    @PatchMapping("/{id}")
    public SuccessResponse renameColumn(@PathVariable String id,
                                        @Valid @RequestBody RenameColumnRequest request) {
        columnService.renameColumn(id, request);
        return SuccessResponse.ok();
    }

    @DeleteMapping("/{id}")
    public SuccessResponse deleteColumn(@PathVariable String id) {
        columnService.deleteColumn(id);
        return SuccessResponse.ok();
    }
}
