db = db.getSiblingDB("user_management");

db.createCollection('users');

db.users.insertOne({
    firstName: 'Administrateur',
    lastName: 'Système',
    email: 'admin@usermanagement.com',
    password: "$2b$10$rQZ9tHlG8LZYzZkJ8JGQKePHfLJc9XqC6h1FRrW8yXvG9b4HfF5Sm",
    birthDate: "1995-01-01T00:00:00.000Z",
    city: "Paris",
    zipcode: "75001",
    role: "admin",
    permissions: ["read", "delete"]
});
