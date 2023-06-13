# Problems with the current DB model

- Lobbies (Beginner, Intermediate, Advanced, Expert, Grandmaster) are not in the model. Sorting for campaigns is currently achieved through the `sort_x` fields of `Map`.
  - Possible solution: New Type `CollabSort` that determines the names for each sort field
  - Example: Strawberry Jam -> `sort_1 == 1` is named "Beginner", `sort_2 == 1` is named "Green", `sort_2 == 4` is named "Cracked", `sort_2 == 5` is named "Heart Side"