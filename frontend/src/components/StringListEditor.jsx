import { faArrowDown, faArrowUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider, Grid, Select, Stack, TextField, Typography } from "@mui/material";
import { CustomIconButton } from "./BasicComponents";

export function StringListEditor({
  label,
  list,
  valueCount,
  valueTypes,
  valueLabels = [],
  setList,
  inline = false,
  reorderable = false,
  sx = {},
}) {
  const addItem = () => {
    const newItem = Array(valueCount).fill("");
    const oldList = list || [];
    setList([...oldList, newItem]);
  };
  const removeItem = (index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const updateValue = (itemIndex, index, value) => {
    const newList = list.map((item, i) => {
      if (i === itemIndex) {
        return item.map((v, j) => {
          if (j === index) {
            return value;
          }
          return v;
        });
      }
      return item;
    });
    setList(newList);
  };
  const moveItem = (index, direction) => {
    const oldList = list || [];
    const newList = [...oldList];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newList.length) {
      return;
    }
    const temp = newList[index];
    newList[index] = newList[newIndex];
    newList[newIndex] = temp;
    setList(newList);
  };

  if (!valueTypes || valueTypes.length !== valueCount) {
    return (
      <Typography variant="body2" color={(t) => t.palette.error.main}>
        Error: valueTypes and valueCount do not match
      </Typography>
    );
  }

  return (
    <>
      <Grid container spacing={1} sx={{ mb: 1, ...sx }}>
        <Grid item xs="auto">
          <Typography variant="h6">{label}</Typography>
        </Grid>
        <Grid item xs="auto">
          <Button variant="contained" size="small" color="primary" onClick={addItem}>
            Add Item
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        {(list === null || list.length === 0) && (
          <Grid item xs={12}>
            <Typography variant="body2">No items</Typography>
          </Grid>
        )}
        {list &&
          list.map((item, itemIndex) => (
            <>
              <Grid key={itemIndex} item xs={12}>
                <Grid container spacing={1.5}>
                  {item.map((value, index) => {
                    const typeInfo = valueTypes[index];
                    return (
                      <Grid key={index} item xs={12} sm={inline ? inline[index] : 12}>
                        <StringListItem
                          item={item}
                          index={index}
                          typeInfo={typeInfo}
                          label={valueLabels[index]}
                          value={value}
                          setValue={(value) => updateValue(itemIndex, index, value)}
                        />
                      </Grid>
                    );
                  })}
                  <Grid item xs={12}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeItem(itemIndex)}
                        startIcon={<FontAwesomeIcon icon={faTrash} />}
                        sx={{ minWidth: "unset" }}
                      >
                        Remove Item
                      </Button>
                      {reorderable && (
                        <>
                          <CustomIconButton
                            variant="outlined"
                            color="primary"
                            onClick={() => moveItem(itemIndex, -1)}
                            sx={{ alignSelf: "stretch" }}
                            disabled={itemIndex === 0}
                          >
                            <FontAwesomeIcon icon={faArrowUp} />
                          </CustomIconButton>
                          <CustomIconButton
                            variant="outlined"
                            color="primary"
                            onClick={() => moveItem(itemIndex, 1)}
                            sx={{ alignSelf: "stretch" }}
                            disabled={itemIndex === list.length - 1}
                          >
                            <FontAwesomeIcon icon={faArrowDown} />
                          </CustomIconButton>
                        </>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
              {itemIndex < list.length - 1 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>
              )}
            </>
          ))}
      </Grid>
    </>
  );
}

function StringListItem({ item, index, typeInfo, label, value, setValue }) {
  const type = typeInfo.type;
  if (type === "string") {
    const multiline = typeInfo.multiline || false;
    return (
      <TextField
        fullWidth
        label={label}
        value={value}
        multiline={multiline}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  } else if (type === "enum") {
    let options = typeInfo.options; //Array of MenuItems
    //if options is a function, call it with the item, index and value as arguments
    if (typeof options === "function") {
      options = options(item, index, value);
    }
    return (
      <TextField
        label={label}
        select
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        displayEmpty
        MenuProps={{ disableScrollLock: true }}
      >
        {options}
      </TextField>
    );
  }
}
