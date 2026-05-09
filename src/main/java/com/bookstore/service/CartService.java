package com.bookstore.service;

import com.bookstore.model.CartItem;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {
    // In-memory cart storage per session (simplified)
    private final Map<String, List<CartItem>> carts = new ConcurrentHashMap<>();

    public List<CartItem> getCart(String sessionId) {
        return carts.getOrDefault(sessionId, new ArrayList<>());
    }

    public void addToCart(String sessionId, CartItem item) {
        List<CartItem> cart = carts.computeIfAbsent(sessionId, k -> new ArrayList<>());
        Optional<CartItem> existing = cart.stream()
            .filter(i -> i.getBookId().equals(item.getBookId()))
            .findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + item.getQuantity());
        } else {
            cart.add(item);
        }
    }

    public void removeFromCart(String sessionId, Long bookId) {
        List<CartItem> cart = carts.get(sessionId);
        if (cart != null) {
            cart.removeIf(i -> i.getBookId().equals(bookId));
        }
    }

    public void clearCart(String sessionId) {
        carts.remove(sessionId);
    }

    public double getTotal(String sessionId) {
        return getCart(sessionId).stream()
            .mapToDouble(i -> i.getPrice() * i.getQuantity())
            .sum();
    }
}