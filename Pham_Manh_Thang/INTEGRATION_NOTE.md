# Integration Note - Pham Manh Thang

## Module: Product Management, Category Management, Listing Contract

### Overview
This module implements the Product Approval, Category Management, and Listing Contract features as per the requirements.

### Generated Components

#### Entities (com.swp391.entity)
- `Role.java`
- `User.java`
- `Category.java`
- `Product.java`
- `ProductApproval.java`
- `Contract.java`

#### DTOs (com.swp391.dto)
- `ApiResponse.java` - Standard API response wrapper
- `ProductResponseDTO.java` - Product response DTO
- `ProductApprovalRequestDTO.java` - Request DTO for product approval/rejection
- `CategoryDTO.java` - Category request/response DTO

#### Exceptions (com.swp391.exception)
- `ResourceNotFoundException.java` - 404 not found
- `BusinessException.java` - 400 business logic errors
- `GlobalExceptionHandler.java` - Global exception handler

#### Repositories (com.swp391.repository)
- `UserRepository.java`
- `CategoryRepository.java` - With search functionality
- `ProductRepository.java`
- `ProductApprovalRepository.java`
- `ContractRepository.java`

#### Services (com.swp391.service & com.swp391.service.impl)
- `CategoryService.java` + `CategoryServiceImpl.java` - CRUD + search categories
- `ProductService.java` + `ProductServiceImpl.java` - Product approval/rejection flow
- `ContractService.java` + `ContractServiceImpl.java` - Create listing contracts

#### Controllers (com.swp391.controller)
- `CategoryController.java` - Category CRUD API
- `ProductAdminController.java` - Product approval API

### APIs Provided

#### Product Approval Module
- `GET /admin/products/pending` - Get all pending products
- `GET /admin/products/{productId}` - Get product details
- `POST /admin/products/{productId}/approve` - Approve product
- `POST /admin/products/{productId}/reject` - Reject product

#### Category Management Module
- `GET /admin/categories` - Get all categories
- `GET /admin/categories/{categoryId}` - Get category by id
- `GET /admin/categories/search?keyword=...` - Search categories
- `POST /admin/categories` - Create category
- `PUT /admin/categories/{categoryId}` - Update category
- `DELETE /admin/categories/{categoryId}` - Delete category

### External Dependencies & TODOs

1. **Spring Security (JWT)** - TODO
   - Replace hardcoded `reviewerId = 1L` with actual authenticated user
   - Add authorization checks for admin/staff roles

2. **Auction Service** - TODO (other team member)
   - When product is approved, automatically create an auction
   - Location: `ProductServiceImpl.approveProduct()`

3. **Notification Service** - TODO (other team member)
   - Notify seller when product is approved/rejected
   - Location: `ProductServiceImpl.approveProduct()`, `ProductServiceImpl.rejectProduct()`

4. **PDF Generation Service** - TODO
   - Generate actual PDF contract file
   - Upload to cloud storage (Cloudinary/S3)
   - Location: `ContractServiceImpl.createListingContract()`

5. **Cloud Storage Service** - TODO
   - Store generated PDF files
   - Location: `ContractServiceImpl.createListingContract()`

### Database Tables Used
- `Roles`
- `Users`
- `Categories`
- `Products`
- `ProductApprovals`
- `Contracts`

### Configuration
- Spring Boot 3.2.0
- Java 21
- SQL Server (configurable in `application.properties`)
- Spring Data JPA
- Lombok
- Jakarta Validation
