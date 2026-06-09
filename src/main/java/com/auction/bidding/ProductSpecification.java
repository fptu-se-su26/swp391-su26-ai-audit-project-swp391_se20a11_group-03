package com.hoangxuananhtuan.auction.specification;

import com.hoangxuananhtuan.auction.domain.Product;
import org.springframework.data.jpa.domain.Specification;


public class ProductSpecification {

    public static Specification<Product> hasProductName(String productName) {
        return (root, query, cb) ->
                productName == null || productName.isBlank()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("productName")), "%" + productName.toLowerCase() + "%");
    }

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) ->
                categoryId == null ? cb.conjunction() : cb.equal(root.get("category").get("categoryId"), categoryId);
    }

    public static Specification<Product> hasMinStartingPrice(Long minStartingPrice) {
        return (root, query, cb) ->
                minStartingPrice == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("startingPrice"), minStartingPrice);
    }

    public static Specification<Product> hasMaxStartingPrice(Long maxStartingPrice) {
        return (root, query, cb) ->
                maxStartingPrice == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("startingPrice"), maxStartingPrice);
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE");
    }
}
