package com.taskboard.controller;

import com.taskboard.dto.CreateColumnRequest;
import com.taskboard.dto.RenameColumnRequest;
import com.taskboard.dto.SuccessResponse;
import com.taskboard.service.ColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SuccessResponse createColumn(@RequestBody CreateColumnRequest request) {
        columnService.createColumn(request);
        return SuccessResponse.ok();
    }

    @PatchMapping("/{id}")
    public SuccessResponse renameColumn(@PathVariable String id,
                                        @RequestBody RenameColumnRequest request) {
        columnService.renameColumn(id, request);
        return SuccessResponse.ok();
    }

    @DeleteMapping("/{id}")
    public SuccessResponse deleteColumn(@PathVariable String id) {
        columnService.deleteColumn(id);
        return SuccessResponse.ok();
    }
}
