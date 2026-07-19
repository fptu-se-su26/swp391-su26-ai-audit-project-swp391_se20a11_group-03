package com.auction.order.dto;
import lombok.Data;
@Data public class OrderActionRequest { private Long shipperId; private String action; private String status; private String note; }
