package com.taskboard.controller;

import com.taskboard.dto.BoardResponse;
import com.taskboard.dto.ReorderRequest;
import com.taskboard.dto.SuccessResponse;
import com.taskboard.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/board")
    public BoardResponse getBoard() {
        return boardService.getBoard();
    }

    @GetMapping("/board/search")
    public BoardResponse searchBoard(@RequestParam String q) {
        return boardService.searchBoard(q);
    }

    @PutMapping("/board/reorder")
    public SuccessResponse reorder(@RequestBody ReorderRequest request) {
        boardService.reorder(request);
        return SuccessResponse.ok();
    }
}
