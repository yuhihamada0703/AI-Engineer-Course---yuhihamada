package com.taskboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SuccessResponse {
    private boolean success;

    public static SuccessResponse ok() {
        return new SuccessResponse(true);
    }
}
