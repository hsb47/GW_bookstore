package com.bookstore.controller;

import com.bookstore.service.CartService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {
    private final CartService cartService;

    public CheckoutController(CartService cartService) {
        this.cartService = cartService;
    }

    private String getSessionId(HttpServletRequest request) {
        String sessionId = request.getHeader("X-Session-Id");
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = (String) request.getSession().getAttribute("cartSession");
            if (sessionId == null) {
                sessionId = UUID.randomUUID().toString();
                request.getSession().setAttribute("cartSession", sessionId);
            }
        }
        return sessionId;
    }

    @PostMapping
    public ResponseEntity<?> checkout(HttpServletRequest request) {
        String sessionId = getSessionId(request);
        double total = cartService.getTotal(sessionId);
        if (total == 0) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Cart is empty"));
        }
        String orderId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        cartService.clearCart(sessionId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Order placed successfully!");
        response.put("orderId", orderId);
        response.put("total", total);
        return ResponseEntity.ok(response);
    }
}