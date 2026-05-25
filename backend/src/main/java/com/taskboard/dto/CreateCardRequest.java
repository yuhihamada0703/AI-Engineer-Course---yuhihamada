package com.taskboard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateCardRequest {
    private String id;
    private String title;
    private String description;
    private String columnId;
    private String priority;
}
