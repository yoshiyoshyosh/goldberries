import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider, Grid, TextField, Typography } from "@mui/material";

export function StringListEditor({ label, valueLabels = [], list, valueCount, setList, inline = false }) {
  const addItem = () => {
    const newItem = Array(valueCount).fill("");
    setList([...list, newItem]);
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

  return (
    <>
      <Grid container spacing={1} sx={{ mb: 1 }}>
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
                  {item.map((value, index) => (
                    <Grid
                      key={index}
                      item
                      xs={12}
                      sm={inline ? 12 / valueCount - (index === valueCount - 1 ? 1 : 0) : 12}
                    >
                      <TextField
                        fullWidth
                        label={valueLabels[index]}
                        value={value}
                        onChange={(e) => updateValue(itemIndex, index, e.target.value)}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={inline ? "auto" : 12}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeItem(itemIndex)}
                      startIcon={<FontAwesomeIcon icon={faTrash} />}
                      sx={{ minWidth: "unset" }}
                    >
                      Remove Item
                    </Button>
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
