import os
import subprocess
import random
import string

# List of random commit messages related to web development, Spring Boot, and React.js
web_topics = [

    # React.js
    "Add React component for user dashboard",
    "Update React state management with Redux",
    "Implement React hooks for form handling",
    "Add React routing with React Router",
    "Fix React component rendering issues",
    "Optimize React app performance with memo",
    "Add React context for global state",
    "Update React props validation with PropTypes",
    "Implement React API calls with Axios",
    "Add unit tests for React components",
    "Refactor React functional components",
    "Implement React lazy loading for components",
    "Add React error boundaries",
    "Update React styling with styled-components",
    "Implement React form validation",
    "Add React animations with Framer Motion",
    "Fix React accessibility issues",
    "Implement React internationalization",
    "Add React testing with Jest",
    "Optimize React bundle size",
    # Register Feature (React.js)
    "Add basic Register component structure with imports and state",
    "Implement handleChange function for form input handling",
    "Implement handleSubmit function for form submission",
    "Add password confirmation validation in handleSubmit",
    "Add success navigation to login page after registration",
    "Add error handling and display in UI",
    "Add loading state management",
    "Add basic UI structure with header and logo",
    "Add form fields for user input (name, email, password, confirmPassword)",
    "Add additional form fields (phone, address)",
    "Add form styling and responsive design",
    "Add submit button with disabled state during loading",
    # Login Feature (React.js)
    "Add basic Login component structure with imports and state",
    "Implement handleChange function for login form input handling",
    "Implement handleSubmit function for login form submission",
    "Add error handling and display in login UI",
    "Add loading state management for login process",
    "Add success navigation to home page after login",
    "Add basic login UI structure with header and logo",
    "Add login form fields for username and password",
    "Add login form styling and responsive design",
    "Add login submit button with disabled state during loading",
    # Profile Feature (React.js)
    "Add basic Profile component structure with imports and state",
    "Implement handleFetchProfile function for fetching user data",
    "Implement handleChange function for profile form input handling",
    "Implement handleSubmit function for profile update submission",
    "Add profile data state management and API integration",
    "Add success/error message handling for profile updates",
    "Add loading state management for profile operations",
    "Add profile info display UI with user avatar and details",
    "Add profile edit form with multiple input fields",
    "Add profile form validation and error display",
    "Add profile page styling and responsive grid layout",
    "Add profile update button with disabled state during loading"
    ]
def main():
    try:
        # Ask user for number of commits
        num_commits = int(input("Enter the number of commits: "))
        
        if num_commits <= 0:
            print("Number of commits must be positive.")
            return
        
        for i in range(num_commits):
            # Git add all changes
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Git commit with random message (allow empty commits)
            message = random.choice(web_topics)
            subprocess.run(['git', 'commit', '--allow-empty', '-m', message], check=True)
            
            # Git push after each commit
            subprocess.run(['git', 'push'], check=True)
            
            print(f"Committed and pushed: {message}")
        
        print(f"Successfully created {num_commits} commits.")
    
    except ValueError:
        print("Invalid input. Please enter a valid number.")
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()