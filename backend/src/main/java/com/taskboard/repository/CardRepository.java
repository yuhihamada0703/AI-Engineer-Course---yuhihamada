package com.taskboard.repository;

import com.taskboard.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<CardEntity, String> {

    @Query("SELECT COALESCE(MAX(c.position), -1) FROM CardEntity c WHERE c.column.id = :columnId")
    int findMaxPositionByColumnId(@Param("columnId") String columnId);

    @Query("SELECT c FROM CardEntity c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY c.column.position ASC, c.position ASC")
    List<CardEntity> searchByKeyword(@Param("keyword") String keyword);
}
