package com.bookstore.controller;

import com.bookstore.model.CartItem;
import com.bookstore.service.CartService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
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

    @GetMapping
    public ResponseEntity<?> getCart(HttpServletRequest request) {
        String sessionId = getSessionId(request);
        List<CartItem> cart = cartService.getCart(sessionId);
        double total = cartService.getTotal(sessionId);
        Map<String, Object> response = new HashMap<>();
        response.put("items", cart);
        response.put("total", total);
        response.put("sessionId", sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartItem item, HttpServletRequest request) {
        String sessionId = getSessionId(request);
        cartService.addToCart(sessionId, item);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Added to cart");
        response.put("sessionId", sessionId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long bookId, HttpServletRequest request) {
        String sessionId = getSessionId(request);
        cartService.removeFromCart(sessionId, bookId);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Removed from cart"));
    }
}