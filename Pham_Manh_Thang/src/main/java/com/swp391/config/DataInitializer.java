package com.swp391.config;

import com.swp391.entity.*;
import com.swp391.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public void run(String... args) {
        // Initialize Roles if not exists
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setRoleName("Admin");
            roleRepository.save(adminRole);

            Role staffRole = new Role();
            staffRole.setRoleName("Staff");
            roleRepository.save(staffRole);

            Role sellerRole = new Role();
            sellerRole.setRoleName("Seller");
            roleRepository.save(sellerRole);

            Role userRole = new Role();
            userRole.setRoleName("User");
            roleRepository.save(userRole);
            log.info("Roles initialized");
        }

        // Initialize Admin User if not exists
        Role adminRole = roleRepository.findByRoleName("Admin").orElse(null);
        if (adminRole != null && userRepository.findByEmail("binbin233444@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setRole(adminRole);
            admin.setUsername("admin");
            admin.setEmail("binbin233444@gmail.com");
            admin.setAuthProvider("LOCAL");
            admin.setStatus("ACTIVE");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            log.info("Admin user created");
        }

        // Initialize Seller User if not exists
        Role sellerRole = roleRepository.findByRoleName("Seller").orElse(null);
        User seller = null;
        if (sellerRole != null) {
            Optional<User> existingSellerByEmail = userRepository.findByEmail("thuhuongiuudau1@gmail.com");
            if (existingSellerByEmail.isPresent()) {
                seller = existingSellerByEmail.get();
            } else {
                seller = new User();
                seller.setRole(sellerRole);
                seller.setUsername("seller_thuhuong");
                seller.setEmail("thuhuongiuudau1@gmail.com");
                seller.setAuthProvider("LOCAL");
                seller.setStatus("ACTIVE");
                seller.setCreatedAt(LocalDateTime.now());
                seller = userRepository.save(seller);
                log.info("Seller user created");
            }
        }

        // Initialize Categories if not exists
        if (categoryRepository.count() == 0) {
            Category category1 = new Category();
            category1.setCategoryName("Điện tử");
            category1.setDescription("Sản phẩm điện tử");
            category1.setIsActive(true);
            category1.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category1);

            Category category2 = new Category();
            category2.setCategoryName("Thời trang");
            category2.setDescription("Sản phẩm thời trang");
            category2.setIsActive(true);
            category2.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category2);

            Category category3 = new Category();
            category3.setCategoryName("Nội thất");
            category3.setDescription("Sản phẩm nội thất");
            category3.setIsActive(true);
            category3.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category3);
            log.info("Categories initialized");
        }

        // Initialize 5 Sample Products if not exists
        if (productRepository.count() == 0 && seller != null) {
            List<Category> categories = categoryRepository.findAll();

            // Product 1
            Product product1 = new Product();
            product1.setSellerId(seller.getUserId());
            product1.setCategoryId(categories.get(0).getCategoryId());
            product1.setProductName("Điện thoại iPhone 15 Pro Max");
            product1.setDescription("Điện thoại mới, chưa qua sử dụng, nguyên seal");
            product1.setStartingPrice(30000000L);
            product1.setStepPrice(1000000L);
            product1.setTaxPercent(5);
            product1.setStatus("PENDING");
            product1.setSubmittedAt(LocalDateTime.now());
            product1.setCreatedAt(LocalDateTime.now());
            product1 = productRepository.save(product1);
            addProductImage(product1, "https://example.com/iphone15.jpg", true);

            // Product 2
            Product product2 = new Product();
            product2.setSellerId(seller.getUserId());
            product2.setCategoryId(categories.get(0).getCategoryId());
            product2.setProductName("Laptop MacBook Pro 14 inch");
            product2.setDescription("Laptop Apple M3 Pro, RAM 16GB, SSD 512GB");
            product2.setStartingPrice(50000000L);
            product2.setStepPrice(2000000L);
            product2.setTaxPercent(5);
            product2.setStatus("PENDING");
            product2.setSubmittedAt(LocalDateTime.now());
            product2.setCreatedAt(LocalDateTime.now());
            product2 = productRepository.save(product2);
            addProductImage(product2, "https://example.com/macbook.jpg", true);

            // Product 3
            Product product3 = new Product();
            product3.setSellerId(seller.getUserId());
            product3.setCategoryId(categories.get(1).getCategoryId());
            product3.setProductName("Áo thun nam cao cấp");
            product3.setDescription("Áo thun chất liệu cotton 100%, size L");
            product3.setStartingPrice(500000L);
            product3.setStepPrice(50000L);
            product3.setTaxPercent(5);
            product3.setStatus("PENDING");
            product3.setSubmittedAt(LocalDateTime.now());
            product3.setCreatedAt(LocalDateTime.now());
            product3 = productRepository.save(product3);
            addProductImage(product3, "https://example.com/aothun.jpg", true);

            // Product 4
            Product product4 = new Product();
            product4.setSellerId(seller.getUserId());
            product4.setCategoryId(categories.get(2).getCategoryId());
            product4.setProductName("Ghế gỗ thông minh");
            product4.setDescription("Ghế gỗ sồi, điều chỉnh độ nghiêng được");
            product4.setStartingPrice(5000000L);
            product4.setStepPrice(500000L);
            product4.setTaxPercent(5);
            product4.setStatus("PENDING");
            product4.setSubmittedAt(LocalDateTime.now());
            product4.setCreatedAt(LocalDateTime.now());
            product4 = productRepository.save(product4);
            addProductImage(product4, "https://example.com/ghego.jpg", true);

            // Product 5
            Product product5 = new Product();
            product5.setSellerId(seller.getUserId());
            product5.setCategoryId(categories.get(0).getCategoryId());
            product5.setProductName("Tai nghe AirPods Pro 2");
            product5.setDescription("Tai nghe không dây, chống ồn");
            product5.setStartingPrice(6000000L);
            product5.setStepPrice(200000L);
            product5.setTaxPercent(5);
            product5.setStatus("PENDING");
            product5.setSubmittedAt(LocalDateTime.now());
            product5.setCreatedAt(LocalDateTime.now());
            product5 = productRepository.save(product5);
            addProductImage(product5, "https://example.com/airpods.jpg", true);

            log.info("5 sample products initialized");
        }

        if (seller != null) {
            initializeBulkTestProducts(seller);
        }
    }

    private void addProductImage(Product product, String imageUrl, boolean isPrimary) {
        ProductImage image = new ProductImage();
        image.setProductId(product.getProductId());
        image.setImageUrl(imageUrl);
        image.setIsPrimary(isPrimary);
        productImageRepository.save(image);
    }

    private void initializeBulkTestProducts(User seller) {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            return;
        }

        Set<String> existingProductNames = productRepository.findAll().stream()
                .map(Product::getProductName)
                .collect(Collectors.toSet());

        int createdCount = 0;
        for (int i = 1; i <= 50; i++) {
            String productName = "San pham test " + i;
            if (existingProductNames.contains(productName)) {
                continue;
            }

            Category category = categories.get((i - 1) % categories.size());
            Product product = new Product();
            product.setSellerId(seller.getUserId());
            product.setCategoryId(category.getCategoryId());
            product.setProductName(productName);
            product.setDescription("San pham mau de test approve/reject va phan trang - item " + i);
            product.setStartingPrice(1_000_000L + (i * 250_000L));
            product.setStepPrice(100_000L + (i * 10_000L));
            product.setTaxPercent(5);
            product.setStatus("PENDING");
            product.setSubmittedAt(LocalDateTime.now().minusMinutes(i));
            product.setCreatedAt(LocalDateTime.now().minusMinutes(i));
            product = productRepository.save(product);
            addProductImage(product, "https://example.com/test-product-" + i + ".jpg", true);
            createdCount++;
        }

        if (createdCount > 0) {
            log.info("{} bulk test products initialized", createdCount);
        }
    }
}
