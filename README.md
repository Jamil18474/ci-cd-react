# React User Registration App

A simple React application that allows users to register by filling out a form with their personal details. The application validates the information, and displays a list of registered users. The app also includes test coverage and uses GitHub Actions for CI/CD.

---

## Summary

- [Production URLs](#production-urls)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables (.env.template)](#environment-variables-envtemplate)
- [Available Scripts](#available-scripts)
- [Running Tests](#running-tests)
- [Generate API Documentation](#generate-api-documentation)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Deployment](#deployment)
- [NPM Package Build and Publish](#npm-package-build-and-publish)
- [Technologies Used](#technologies-used)
- [Usage with Docker](#usage-with-docker)

---

## Production URLs

- **Production Frontend**: [https://jamil18474.github.io/ci-cd-react/](https://jamil18474.github.io/ci-cd-react/)
- **Production Backend API**: [https://ci-cd-back-dbsx.onrender.com](https://ci-cd-back-dbsx.onrender.com)

---

## Prerequisites

Before you can run this project, make sure you have the following installed:

- **Node.js**
- **npm** (Node Package Manager)
- **Docker** and **Docker Compose**

You can check if these are installed by running:

```bash
node -v
npm -v
docker --version
docker-compose --version
```

---

## Getting Started

1. **Clone the Repository**

Clone the project to your local machine:

```bash
git clone https://github.com/Jamil18474/ci-cd-react.git
cd ci-cd-react
```

2. **Install Dependencies**

```bash
npm install
```


---

## Environment Variables (.env.template)

All configuration for the frontend is managed through the `.env.template` file at the project root.

**Instructions:**
1. Copy `.env.template` to `.env`:

```bash
cp .env.template .env
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
npm run build
```

Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

---

## Running Tests

1. **Run Unit and Integration Tests**

To run the unit and integration tests, run:

```bash
npm run test
```

This will start Jest in watch mode, running all the tests defined in your project.

2. **Check Test Coverage**

Codecov integration is set up to track test coverage. After running the tests, the coverage report will be uploaded automatically to Codecov.
You can view the coverage details on the Codecov website available at : https://app.codecov.io/gh/Jamil18474/ci-cd-react
---

## Generate API Documentation

To generate API documentation for the project using JSDoc, run the following command:

```bash
npm run jsdoc
```

This will create a docs folder containing the generated documentation based on the comments in your code.

You can view the documentation locally : http://localhost:3000/ci-cd-react/docs/
or in production : https://jamil18474.github.io/ci-cd-react/docs/
---

## GitHub Actions CI/CD

This project is configured with GitHub Actions for continuous integration and deployment (CI/CD). The following steps are automated:

- Build and Test: Tests are automatically run, and code coverage is reported to Codecov.
- Deployment: The app is automatically deployed to GitHub Pages when code is pushed to the master branch.

---

## Deployment

The app is deployed to GitHub Pages using GitHub Actions. To deploy, simply push to the master branch, and the app will be built and deployed automatically.

---

## NPM Package Build and Publish

This project includes automation for building, versioning, and publishing the NPM package to the NPM registry. Below are the key steps involved:

**Configure Git:** Git user settings are configured to automatically commit with the correct user information:

```bash
git config --global user.email "jamil.abdelhamid@ynov.com"
git config --global user.name "Jamil18474"
```

**Build the NPM Package:** The NPM package is built using the following command, which compiles the necessary files for publishing:

```bash
npm run build-npm
```

**Versioning:** The version of the package is bumped (using the patch version increment):

```bash
npm version patch
```

**Publish:** After building and versioning, the package is automatically published to the NPM registry:

```bash
npm publish
```

NPM Authentication Token: An authentication token stored in GitHub secrets (`NPM_TOKEN`) is used for secure publishing.

---

## Technologies Used

- React: JavaScript library for building the user interface.
- Material-UI: React components that implement Google's Material Design.
- Jest: Testing framework for React.
- Codecov: Code coverage tool integrated with the GitHub repository.
- JSDoc: Tool for generating API documentation from comments in the code.
- GitHub Actions: CI/CD pipeline for automatic testing, building, and deployment.
- npm: Package manager used to install dependencies and automate build tasks.

---

## Usage with Docker

You can run the **frontend** locally using Docker Compose.

### 1. Prerequisites

- Docker and Docker Compose installed
- `.env` files correctly configured for frontend

### 2. Start the stack

From the root folder (where your `docker-compose.yml` is), run:

```bash
docker-compose -f docker-compose.yml up --build -d
```

This will start:
- the frontend app on [http://localhost:3000](http://localhost:3000)

You can now use the application locally.

---

### Stopping and Removing Docker Containers and Volumes

To **stop and remove the container**, use:

```bash
docker-compose -f docker-compose.yml down
```

---

### Explanation of Sections

- **Production URLs**: Direct links to production deployments of the frontend and backend.
- **Prerequisites**: List of tools required to run the project (Node.js, npm, Docker).
- **Getting Started**: Instructions to clone the project and install dependencies.
- **Environment Variables**: How to configure environment for local/prod.
- **Available Scripts**: Basic commands to run the application and build.
- **Running Tests**: Instructions for running unit tests and checking code coverage reports via Codecov.
- **Generate API Documentation**: Instructions for generating API documentation using JSDoc.
- **GitHub Actions CI/CD**: Explanation of the CI/CD process configured with GitHub Actions to automate the build, tests, and deployment to GitHub Pages.
- **Deployment**: Process of automatic deployment via GitHub Actions to GitHub Pages.
- **NPM Package Build** and Publish: Steps for automating the NPM package build, versioning, and publishing process.
- **Technologies Used**: List of the main technologies used in the project.
- **Usage with Docker**: How to run the frontend with Docker Compose for local development.

This `README.md` file contains all the necessary information to get started, test, and deploy your project with detailed instructions.