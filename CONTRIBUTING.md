
# Contributing


## Team Norms

### Team Values


-  When a member needs help, they will message the others on Discord to solicit advice.
-   When a disagreement arises between choices A and B, the concerned parties will collaborate to create choice C, which improves upon both A and B.
-   When a member is failing to deliver on their obligations to the team, the others will decide how to split the unfinished work and how to re-engage the fallen member.
 -   Team members are expected to respond to messages directed at them in <1 hour during their work hours.

### Sprint Cadence

-   A sprint is 2 weeks long.

### Daily Standups

[](https://github.com/nyu-software-engineering/scrum-framework/blob/main/team-norms.md#daily-standups)
-   Every Monday, Wednesday, and Thursday, the team meets on Zoom at 12 PM EST for a 45-minute Daily Standup.
- At each Standup, each developer answers: 
	-   What have you done since last time?
	-   What are you doing now?
	-   Is there anything blocking your progress?
-   All members are expected to be present synchronously.
-   Members will not cover for other members who do not participate.
-   A member who makes no progress on a task for two standups or more in a row will be reported to management.

### Coding Standards

Our team codes in **Visual Studio Code** using **Prettier** for consistent formatting.  
- All code must be peer-reviewed and tested before merging into `main`.
- Only push working code; if you break things, fix them right away.  
- Commit small, focused changes with clear messages.  
- Write readable, self-documenting code with meaningful names.  
- Delete dead or commented-out code instead of leaving it behind.  
- Add basic automated tests for important features once we’ve learned how.

## Git Workflow

This is our shared Git workflow for all sprints. Every branch, commit, and pull request should follow this process to keep our code clean, reviewed, and in sync.

1. **Pull latest main**
2. **Create a new branch**
- Formatting examples:
    - `task/<name>` 
    - `spike/<name>` 
    - `bugfix/<name>`
3. **Commit small changes**
4. **Push your branch**  
5. **Open a Pull Request (PR)**  
6. **Review & Merge**  

---

## Build & Test Instructions

### Front-End Development

The front-end is built with React.js. To get started:

1. Fork the [repository](https://github.com/agile-students-fall2025/4-final-random_nutripal) on GitHub.

2. Clone the repository onto your machine:
    ```bash
    git clone https://github.com/agile-students-fall2025/4-final-random_nutripal
    ```

3. Navigate to the front-end directory:
   ```bash
   cd front-end
   ```

4. Install dependencies (first time only):
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm start
   ```

6. The app will open at [http://localhost:3000](http://localhost:3000).

### Back-End Development

_This section will be updated as development progresses._

### Database Setup

_This section will be updated as development progresses._


