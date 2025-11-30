# swe project - ARTichoke
## Steps to set up the project
1. Go into the client folder and run `npm install` This will install all nextjs dependencies used in the project
2. Go back to root folder
3. Go into the server folder and run `python3 -m venv venv`
  - This will create a virtual environment for you
4. Next, we need to activate the virtual environment. This step will depend whether you are on windows or macOS, both achieve the same result
  - Windows:
    - Using command prompt: `venv\Scripts\activate.bat`
    - Using PowerShell: `venv\Scripts\activate.ps1`
    - Using Bash: `source venv/Scripts/activate`
  - MacOS: `source venv/bin/activate`
  - You should see "(venv)" to the left of your command line
5. Then run `pip install -r requirements.txt` This will install all python dependencies within the virtual environment
6. Then run `deactivate` to turn off the virtual environment
7. The final commands require your system to have the Concurrently package
  - run: `npm install -g concurrently` to install it on your device
8. Finally, go back to root folder and run
  - Windows: `npm run dev:win`
  - MacOS: `npm run dev:mac`
9. The project should be running in localhost 3000
10. **Note**: The project require keys from env files. Ask the contributor for them so you can put it in your env files.
