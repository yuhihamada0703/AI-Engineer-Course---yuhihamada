CREATE TABLE columns (
    id          VARCHAR(255) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    position    INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT pk_columns PRIMARY KEY (id)
);

CREATE TABLE cards (
    id          VARCHAR(255) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(4096) NOT NULL DEFAULT '',
    column_id   VARCHAR(255) NOT NULL,
    position    INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT pk_cards PRIMARY KEY (id),
    CONSTRAINT fk_cards_column
        FOREIGN KEY (column_id)
        REFERENCES columns(id)
        ON DELETE CASCADE
);

INSERT INTO columns (id, title, position) VALUES ('col-1', 'To Do',       0);
INSERT INTO columns (id, title, position) VALUES ('col-2', 'In Progress', 1);
INSERT INTO columns (id, title, position) VALUES ('col-3', 'Done',        2);

INSERT INTO cards (id, title, description, column_id, position)
VALUES ('card-1', 'サンプルタスク', 'ここにタスクの詳細を書きます', 'col-1', 0);
