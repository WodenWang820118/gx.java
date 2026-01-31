DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS portfolio_item;

-- intentionally naming this table as customer as "user" has some issues
CREATE TABLE customer (
    id int AUTO_INCREMENT primary key,
    name VARCHAR(50),
    balance int
);

CREATE TABLE portfolio_item (
    id int AUTO_INCREMENT primary key,
    customer_id int,
    ticker VARCHAR(10),
    quantity int,
    foreign key (customer_id) references customer(id)
);

insert into customer(name, balance)
    values
        ('Sam', 10000),
        ('Mike', 10000),
        ('John', 10000);

insert into portfolio_item(customer_id, ticker, quantity)
    values
        (1, 'APPLE', 5),
        (1, 'GOOGLE', 10),
        (2, 'AMAZON', 8),
        (2, 'MICROSOFT', 3),
        (3, 'GOOGLE', 15),
        (3, 'APPLE', 7);