package com.taskboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateCardRequest {

    @NotBlank
    private String id;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 4096)
    private String description;

    @NotBlank
    private String columnId;

    private String priority;
}
