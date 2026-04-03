I want to build an web application optimised for mobile usage.

This app is going to be deployed on Vercel, so make it in a format that is easy for me to deploy there directly.

# Appearance
The app needs to have a smooth and modernised theme, with the appropriate dark/light mode toggle

# Theme
The app is a marathon training app.
The app should be aware of current singapore date and time.
This is a prototype, so you may hardcode most of the components.

# Pages

## Login Page
Hardcode a login page with the google icon or strava icon

## Landing Page
The first page should let the user select an existing plan or a new plan.

## Existing plan page
The page displays the suggested training for the current day, nutrition, and hydration
The user should be able to click on a button to show current progress for the overall training plan outline
The user should also be able to log the current day's training using strava or by manual entry

## New plan page
The page will let the user select if he/she wants to train for the 42, 21 or other common variants of marathons. (Hardcode to disable anything other than 42 for now)
Then the user will have to input details like, preferably providing users with MCQ choices:
```
Age
25 years old
Gender
Male
Height
1.70 m
Weight
65 kg
Current Fitness Level
Beginner
Running Experience
Runs ~5 km once per week
Marathon Experience
None
Injury History
No prior injuries or health conditions
Training Goal
Complete marathon under 5 hours
Training Preference
3 runs per week, preferably in the evenings
```
Then the user has to also key in the marathon date and time.
