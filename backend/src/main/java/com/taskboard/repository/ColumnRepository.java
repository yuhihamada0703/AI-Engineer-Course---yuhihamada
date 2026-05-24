package com.taskboard.repository;

import com.taskboard.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ColumnRepository extends JpaRepository<ColumnEntity, String> {

    List<ColumnEntity> findAllByOrderByPositionAsc();

    @Query("SELECT COALESCE(MAX(c.position), -1) FROM ColumnEntity c")
    int findMaxPosition();
}
