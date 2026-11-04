# Magical Garden

An interactive, child-friendly web game for children aged 8–10, built for our Human–Computer Interaction (HCI) course. The garden has lost its colour, and the child helps restore it by completing three short activities.

## How to run
No installation is needed.
1. Download or clone this repository.
2. Open `index.html` in a modern browser (Chrome, Edge or Firefox).

Optional: in VS Code, right-click `index.html` and choose **Open with Live Server**.

## Project structure
```
magical-garden/
├── index.html         # page structure and all screens
├── style.css          # shared styles
├── script.js          # shared state, navigation, activities
├── assets/            # images / illustrations
├── INTEGRATION.md     # shared rules for team members
└── README.md
```

## The activities
1. **Flower Match**: match flower cards to the same flower in the garden.
2. **Help the Bee**: choose the plant that matches the bee's cue.
3. **Butterfly Garden**: match butterflies to the right flowers.

## HCI design decisions
- **Visibility of system status:** progress is shown as "X of 3 garden tasks complete".
- **Feedback:** every selection gets an immediate message.
- **Error recovery:** wrong choices get gentle messages and can be retried.
- **Consistency:** shared buttons, wording and feedback across all activities.
- **Accessibility:** large buttons, visible keyboard focus, and meaning is never shown by colour alone.
- **Privacy:** no personal data is collected, and nothing is sent to a server.

## Team workflow
- Never commit directly to `main`.
- Work on a branch such as `feature/bee-activity`, then open a pull request.
- At least one teammate reviews each pull request before merging.
- See `INTEGRATION.md` for the shared functions and rules.

## Known limitations
- Designed for desktop/laptop browsers first.
- Progress is not saved between sessions.

## Credits
Illustrations and assets: _(add sources and licences here)_