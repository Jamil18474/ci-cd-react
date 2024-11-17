# React User Registration App

A simple React application that allows users to register by filling out a form with their personal details. The application validates the information before storing it in the `localStorage`, and displays a list of registered users. The app also includes test coverage and uses GitHub Actions for CI/CD.

---

## Prerequisites

Before you can run this project, make sure you have the following installed:

- **Node.js** (version 14.x or above)
- **npm** (Node Package Manager)

You can check if these are installed by running:

```bash
node -v
npm -v
```

---

## Getting Started

1. Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/yourusername/react-user-registration.git
cd react-user-registration
```

2. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

---

## Available Scripts

In the project directory, you can run:

```bash
npm run start
```

Runs the app in development mode.
Open http://localhost:3000 to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

```bash
npm run test
```

Launches the test runner in the interactive watch mode.
You can write tests to verify your application’s functionality using Jest.

```bash
npm run build
```

Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

---

## GitHub Actions CI/CD

This project is configured with GitHub Actions for continuous integration and deployment (CI/CD). The following steps are automated:

    Build and Test: Tests are automatically run, and code coverage is reported to Codecov.
    Deployment: The app is automatically deployed to GitHub Pages when code is pushed to the master branch.

---

## Running Tests

1. Run Unit and Integration Tests

To run the unit and integration tests, run:

```bash
npm test
```

This will start Jest in watch mode, running all the tests defined in your project.
2. Check Test Coverage

Codecov integration is set up to track test coverage. After running the tests, the coverage report will be uploaded automatically to Codecov. You can view the coverage details on the Codecov website.

---

## Deployment

The app is deployed to GitHub Pages using GitHub Actions. To deploy, simply push to the master branch, and the app will be built and deployed automatically.

---

## Technologies Used

    React: JavaScript library for building the user interface.
    Material-UI: React components that implement Google's Material Design.
    Jest: Testing framework for React.
    Codecov: Code coverage tool integrated with the GitHub repository.
    GitHub Actions: CI/CD pipeline for automatic testing, building, and deployment.

--- 


### Explanation of Sections:

- **Prerequisites**: List of tools required to run the project (Node.js and npm).
- **Getting Started**: Instructions to clone the project and install dependencies.
- **Available Scripts**: Basic commands to run the application (`npm run start`), launch tests (`npm run test`), and create a production build (`npm run build`).
- **GitHub Actions CI/CD**: Explanation of the CI/CD process configured with GitHub Actions to automate the build, tests, and deployment to GitHub Pages.
- **Running Tests**: Instructions for running unit tests and checking code coverage reports via Codecov.
- **Deployment**: Process of automatic deployment via GitHub Actions to GitHub Pages.
- **Technologies Used**: List of the main technologies used in the project.

This `README.md` file contains all the necessary information to get started, test, and deploy your project with detailed instructions.

