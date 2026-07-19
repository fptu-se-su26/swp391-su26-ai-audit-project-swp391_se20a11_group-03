from pathlib import Path
root=Path('src/main/java')
repls={
 'import com.auction.product.dto.ApiResponse;':'import com.auction.common.dto.ApiResponse;',
 'com.auction.bidding.entity.Product':'com.auction.product.entity.Product',
 'com.auction.bidding.repository.ProductRepository':'com.auction.product.repository.BiddingProductRepository',
 'com.hoangxuananhtuan.auction.specification.ProductSpecification':'com.auction.product.specification.ProductSpecification',
 'com.hoangxuananhtuan.auction.dto.':'com.auction.product.dto.',
 'import com.auction.product.dto.PageResponse;':'import com.auction.common.dto.PageResponse;',
 'com.swp391.exception.BusinessException':'com.auction.common.exception.BusinessException',
 'com.swp391.exception.ResourceNotFoundException':'com.auction.common.exception.ResourceNotFoundException',
 'com.auction.product.repository.UserRepository':'com.auction.account.dao.UserRepository',
 'implements ProductService':'implements BiddingProductService',
 'private final ProductRepository productRepository;':'private final BiddingProductRepository productRepository;',
 'ProductService productService':'BiddingProductService productService',
 'private final ProductService productService;':'private final BiddingProductService productService;',
 'import com.auction.product.service.BiddingProductService;':'import com.auction.product.service.BiddingProductService;',
}
for p in root.rglob('*.java'):
    s=p.read_text(encoding='utf-8')
    ns=s
    for a,b in repls.items(): ns=ns.replace(a,b)
    if p.as_posix().endswith('product/controller/BiddingProductController.java'):
        ns=ns.replace('import com.auction.product.service.ProductService;','import com.auction.product.service.BiddingProductService;')
        ns=ns.replace('private final ProductService productService;','private final BiddingProductService productService;')
    if p.as_posix().endswith('product/service/impl/BiddingProductServiceImpl.java'):
        ns=ns.replace('import com.auction.product.repository.BiddingProductRepository;','import com.auction.product.repository.BiddingProductRepository;')
        if 'import com.auction.product.repository.BiddingProductRepository;' not in ns:
            ns=ns.replace('import com.auction.bidding.repository.BidRepository;','import com.auction.bidding.repository.BidRepository;\nimport com.auction.product.repository.BiddingProductRepository;')
        if 'import com.auction.common.dto.PageResponse;' not in ns:
            ns=ns.replace('import com.auction.product.service.BiddingProductService;','import com.auction.common.dto.PageResponse;\nimport com.auction.product.service.BiddingProductService;')
    if ns!=s: p.write_text(ns,encoding='utf-8')
print('done')
