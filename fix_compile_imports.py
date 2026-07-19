from pathlib import Path
root = Path('src/main/java')
repls = {
    'BiddingBiddingProductController': 'BiddingProductController',
    'BiddingBiddingProductRepository': 'BiddingProductRepository',
    'BiddingBiddingProductServiceImpl': 'BiddingProductServiceImpl',
    'BiddingBiddingProductService': 'BiddingProductService',
    'com.auction.account.util.AppConfig': 'com.auction.config.AppConfig',
    'com.auction.account.util.FptAiConfig': 'com.auction.config.FptAiConfig',
    'com.auction.account.util.AuditLogUtil': 'com.auction.common.util.AuditLogUtil',
    'com.auction.account.util.TokenUtil': 'com.auction.common.util.TokenUtil',
    'com.auction.account.util.JpaUtil': 'com.auction.common.util.JpaUtil',
    'com.auction.account.service.MailService': 'com.auction.common.service.MailService',
    'com.auction.account.service.OcrService': 'com.auction.common.service.OcrService',
    'com.auction.account.service.AuthAuditService': 'com.auction.common.service.AuthAuditService',
    'com.auction.account.util.LoginRateLimitUtil': 'com.auction.common.util.LoginRateLimitUtil',
    'com.hoangxuananhtuan.auction.dto.AuctionEligibilityResponse': 'com.auction.bidding.dto.AuctionEligibilityResponse',
    'com.hoangxuananhtuan.auction.dto.DepositResponse': 'com.auction.bidding.dto.DepositResponse',
    'com.hoangxuananhtuan.auction.service.AuctionService': 'com.auction.bidding.service.AuctionService',
    'com.hoangxuananhtuan.auction.service.DepositService': 'com.auction.bidding.service.DepositService',
    'com.hoangxuananhtuan.auction.domain.AuctionDeposit': 'com.auction.bidding.entity.AuctionDeposit',
    'com.hoangxuananhtuan.auction.domain.Auction': 'com.auction.bidding.entity.Auction',
    'com.hoangxuananhtuan.auction.domain.Category': 'com.auction.product.entity.Category',
    'com.hoangxuananhtuan.auction.exception.ResourceNotFoundException': 'com.auction.common.exception.ResourceNotFoundException',
    'com.hoangxuananhtuan.auction.repository.AuctionDepositRepository': 'com.auction.bidding.repository.AuctionDepositRepository',
    'com.hoangxuananhtuan.auction.repository.AuctionRepository': 'com.auction.bidding.repository.AuctionRepository',
    'com.hoangxuananhtuan.auction.repository.CategoryRepository': 'com.auction.product.repository.CategoryRepository',
    'com.example.biddingmodule.config.WebSocketConfig': 'com.auction.bidding.config.WebSocketConfig',
    'com.example.biddingmodule.dto.AuctionSessionDto': 'com.auction.bidding.dto.AuctionSessionDto',
    'com.example.biddingmodule.dto.BidRequest': 'com.auction.bidding.dto.BidRequest',
    'com.example.biddingmodule.dto.BidResponse': 'com.auction.bidding.dto.BidResponse',
    'com.example.biddingmodule.service.BiddingService': 'com.auction.bidding.service.BiddingService',
    'com.example.biddingmodule.entity.AuctionStatus': 'com.auction.bidding.entity.AuctionStatus',
    'com.example.biddingmodule.entity.AuctionSession': 'com.auction.bidding.entity.AuctionSession',
    'com.example.biddingmodule.entity.Bid': 'com.auction.bidding.entity.Bid',
    'com.example.biddingmodule.repository.AuctionSessionRepository': 'com.auction.bidding.repository.AuctionSessionRepository',
    'com.example.biddingmodule.repository.BidRepository': 'com.auction.bidding.repository.BidRepository',
}
for p in root.rglob('*.java'):
    s = p.read_text(encoding='utf-8')
    ns = s
    for a,b in repls.items():
        ns = ns.replace(a,b)
    if ns != s:
        p.write_text(ns, encoding='utf-8')
print('done')
