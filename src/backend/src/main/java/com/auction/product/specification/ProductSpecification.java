package com.auction.product.specification;

import com.auction.product.entity.Product;
import org.springframework.data.jpa.domain.Specification;


public class ProductSpecification {

    public static Specification<Product> hasStatus(String status) {
        if (status == null || status.isBlank()) {
            // Return a no-op specification so the caller fully controls which
            // products to surface. The previous behaviour silently substituted
            // "ACTIVE", which made it impossible to query APPROVED or PENDING
            // lots from the public storefront.
            return (root, query, cb) -> cb.conjunction();
        }
        final String normalized = status.trim();
        return (root, query, cb) -> cb.equal(root.get("status"), normalized);
    }

    public static Specification<Product> hasProductName(String productName) {
        return (root, query, cb) ->
                productName == null || productName.isBlank()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("productName")), "%" + productName.toLowerCase() + "%");
    }

    public static Specification<Product> hasCategoryId(Integer categoryId) {
        return (root, query, cb) ->
                categoryId == null ? cb.conjunction() : cb.equal(root.get("categoryId"), categoryId);
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
        return hasStatus("ACTIVE");
    }
}

