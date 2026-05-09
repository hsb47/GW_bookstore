package com.bookstore.model;

public class Review {
    private Long id;
    private Long bookId;
    private String userName;
    private String comment;
    private int rating;
    private String date;

    public Review() {}

    public Review(Long id, Long bookId, String userName, String comment, int rating, String date) {
        this.id = id;
        this.bookId = bookId;
        this.userName = userName;
        this.comment = comment;
        this.rating = rating;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}