# swe project - ARTichoke
## Steps to set up the project
1. cd into client and run `npm install` This will install all nextjs dependencies used in the project
2. Go back into root folder
3. cd into server and run `python3 -m venv venv`
4. This step will depend whether you are on windows or macOS, both achieve the same result
  - Windows:
    - Using command prompt: venv\Scripts\activate.bat
    - Using PowerShell: venv\Scripts\activate.ps1
    - Using Bash: source venv/Scripts/activate
  - MacOS: source venv/bin/activate
5. Then run `pip install -r requirements.txt` This will install all python dependencies within the virtual environment
6. Then run `deactivate` to turn off the virtual environment
7. Finally cd back to root folder and run
  - Windows: `npm run dev:win`
  - MacOS: `npm run dev:mac`
8. The project will be running in localhost 3000
