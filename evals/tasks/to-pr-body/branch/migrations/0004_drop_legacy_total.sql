-- Every order has had its lines since 0003; the old stored total is no longer read.
ALTER TABLE orders DROP COLUMN legacy_total;
