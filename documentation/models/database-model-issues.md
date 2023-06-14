# Problems with the current DB model

- Lobbies (Beginner, Intermediate, Advanced, Expert, Grandmaster) are not in the model. Sorting for campaigns is currently achieved through the `sort_x` fields of `Map`.
  - Possible solution: New Type `CollabSort` that determines the names for each sort field
  - Example: Strawberry Jam -> `sort_1 == 1` is named "Beginner", `sort_2 == 1` is named "Green", `sort_2 == 4` is named "Cracked", `sort_2 == 5` is named "Heart Side"
- `Clear, FC, SB` concept a bit weird for `Challenge` and `Submission`
  - Current model wants 1 `Challenge` per Top Golden List entry
  - Top Golden List entries can be: `Clear, FC, C/FC, SB, FC+SB`
  - Top Golden List entries could potentially also be: `C/SB, FC/SB, C/FC/SB`
  - BUT entries `C/FC, C/SB, FC/SB, C/FC/SB` don't let a `Submission` specify what it is. The current Hard & Standard Golden Lists have this distinction