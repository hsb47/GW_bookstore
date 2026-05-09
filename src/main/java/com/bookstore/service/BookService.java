package com.bookstore.service;

import com.bookstore.model.Book;
import com.bookstore.model.Review;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final List<Book> books = new ArrayList<>();
    private final List<Review> reviews = new ArrayList<>();
    private final AtomicLong bookIdGenerator = new AtomicLong(1);
    private final AtomicLong reviewIdGenerator = new AtomicLong(1);

    public BookService() {
        // Seed data
        books.add(new Book(bookIdGenerator.getAndIncrement(), "The Great Gatsby", 
            "F. Scott Fitzgerald", 
            "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.", 
            10.99, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300", "Classic"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "1984", 
            "George Orwell", 
            "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.", 
            9.99, "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300", "Dystopian"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "To Kill a Mockingbird", 
            "Harper Lee", 
            "A novel about the serious issues of rape and racial inequality told through the eyes of young Scout Finch.", 
            12.99, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300", "Classic"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "Pride and Prejudice", 
            "Jane Austen", 
            "A romantic novel following the character development of Elizabeth Bennet.", 
            8.99, "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300", "Romance"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "The Catcher in the Rye", 
            "J.D. Salinger", 
            "A story about teenage angst and alienation narrated by Holden Caulfield.", 
            11.49, "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300", "Classic"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "Harry Potter and the Sorcerer's Stone", 
            "J.K. Rowling", 
            "A young wizard discovers his magical heritage on his eleventh birthday.", 
            14.99, "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=300", "Fantasy"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "The Hobbit", 
            "J.R.R. Tolkien", 
            "A fantasy novel about the quest of home-loving hobbit Bilbo Baggins.", 
            13.49, "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300", "Fantasy"));
        books.add(new Book(bookIdGenerator.getAndIncrement(), "Sapiens", 
            "Yuval Noah Harari", 
            "A brief history of humankind, from the Stone Age to the twenty-first century.", 
            16.99, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300", "Non-Fiction"));

        // Seed reviews
        reviews.add(new Review(reviewIdGenerator.getAndIncrement(), 1L, "Alice", 
            "Absolutely beautiful prose. A timeless classic!", 5, "2024-01-15"));
        reviews.add(new Review(reviewIdGenerator.getAndIncrement(), 1L, "Bob", 
            "A bit slow in the middle but the ending is perfect.", 4, "2024-02-10"));
        reviews.add(new Review(reviewIdGenerator.getAndIncrement(), 2L, "Charlie", 
            "Terrifyingly relevant even today. Must read!", 5, "2024-03-05"));
    }

    public List<Book> getAllBooks() {
        return new ArrayList<>(books);
    }

    public Optional<Book> getBookById(Long id) {
        return books.stream().filter(b -> b.getId().equals(id)).findFirst();
    }

    public List<Book> searchBooks(String query) {
        String lower = query.toLowerCase();
        return books.stream()
            .filter(b -> b.getTitle().toLowerCase().contains(lower) ||
                         b.getAuthor().toLowerCase().contains(lower))
            .collect(Collectors.toList());
    }

    public List<Review> getReviewsByBookId(Long bookId) {
        return reviews.stream()
            .filter(r -> r.getBookId().equals(bookId))
            .collect(Collectors.toList());
    }

    public Review addReview(Review review) {
        review.setId(reviewIdGenerator.getAndIncrement());
        review.setDate(java.time.LocalDate.now().toString());
        reviews.add(review);
        return review;
    }
}