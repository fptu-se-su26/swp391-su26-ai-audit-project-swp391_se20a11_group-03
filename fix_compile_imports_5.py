from pathlib import Path
root=Path('src/main/java')
normal_product_files=[
 'com/auction/product/controller/ProductController.java',
 'com/auction/product/controller/ProductAdminController.java',
 'com/auction/product/controller/StaffProductController.java',
]
for rel in normal_product_files:
    p=root/rel
    if p.exists():
        s=p.read_text(encoding='utf-8')
        s=s.replace('private final BiddingProductService productService;', 'private final ProductService productService;')
        s=s.replace('private final BiddingProductRepository productRepository;', 'private final ProductRepository productRepository;')
        if 'ProductRepository productRepository' in s and 'import com.auction.product.repository.ProductRepository;' not in s:
            s=s.replace('import com.auction.product.service.ProductService;', 'import com.auction.product.repository.ProductRepository;\nimport com.auction.product.service.ProductService;')
        p.write_text(s,encoding='utf-8')

p=root/'com/auction/product/controller/BiddingProductController.java'
if p.exists():
    s=p.read_text(encoding='utf-8')
    if 'import com.auction.product.service.BiddingProductService;' not in s:
        s=s.replace('import com.auction.product.service.ProductService;', 'import com.auction.product.service.BiddingProductService;')
        if 'import com.auction.product.service.BiddingProductService;' not in s:
            s=s.replace('import org.springframework', 'import com.auction.product.service.BiddingProductService;\nimport org.springframework')
    s=s.replace('private final ProductService productService;', 'private final BiddingProductService productService;')
    p.write_text(s,encoding='utf-8')

p=root/'com/auction/product/service/impl/BiddingProductServiceImpl.java'
if p.exists():
    s=p.read_text(encoding='utf-8')
    s=s.replace('public class BiddingProductServiceImpl implements ProductService', 'public class BiddingProductServiceImpl implements BiddingProductService')
    if 'import com.auction.product.dto.BidResponse;' not in s:
        s=s.replace('import com.auction.product.dto.*;', 'import com.auction.product.dto.*;')
    p.write_text(s,encoding='utf-8')
print('done')
