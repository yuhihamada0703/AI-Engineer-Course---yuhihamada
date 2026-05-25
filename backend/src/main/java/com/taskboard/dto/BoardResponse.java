package com.taskboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class BoardResponse {

    private Map<String, ColumnDto> columns;
    private Map<String, CardDto> cards;
    private List<String> columnOrder;

    @Getter
    @AllArgsConstructor
    public static class ColumnDto {
        private String id;
        private String title;
        private List<String> cardIds;
    }

    @Getter
    @AllArgsConstructor
    public static class CardDto {
        private String id;
        private String title;
        private String description;
        private String priority;
    }
}
