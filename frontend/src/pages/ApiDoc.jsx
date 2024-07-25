import { Box } from "@mui/material";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export function ApiDocPage({}) {
  return (
    <Box sx={{ background: "white", mt: -8, mb: -3 }}>
      <SwaggerUI url="/swagger/swagger.json" />;
    </Box>
  );
}
